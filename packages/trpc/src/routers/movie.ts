import { schema } from "@miru/db";
import { TRPCError } from "@trpc/server";
import { and, count, desc, eq, sql } from "drizzle-orm";
import { z } from "zod";
import { protectedProcedure, publicProcedure, router } from "../trpc";

const STALE_AFTER_MS = 24 * 60 * 60 * 1000; // 24 hours

export const movieRouter = router({
	getByGenre: publicProcedure
		.input(
			z.object({
				genreId: z.number(),
				page: z.number().default(1),
			}),
		)
		.query(async ({ ctx, input }) => {
			const movies = await ctx.db
				.select({
					id: schema.movies.id,
					title: schema.movies.title,
					posterPath: schema.movies.posterPath,
					releaseDate: schema.movies.releaseDate,
					tmdbVoteCount: schema.movies.tmdbVoteCount,
				})
				.from(schema.movieGenres)
				.innerJoin(
					schema.movies,
					eq(schema.movies.id, schema.movieGenres.movieId),
				)
				.where(eq(schema.movieGenres.genreId, input.genreId))
				.orderBy(desc(schema.movies.tmdbVoteCount))
				.limit(20)
				.offset((input.page - 1) * 20);

			const watchlistSet = await getWatchlistSet(
				ctx,
				movies.map((m) => m.id),
			);

			return movies.map((m) => ({
				...m,
				inWatchlist: watchlistSet.has(m.id),
			}));
		}),

	getById: publicProcedure
		.input(z.object({ tmdbId: z.number() }))
		.query(async ({ ctx, input }) => {
			const existing = await ctx.db.query.movies.findFirst({
				where: eq(schema.movies.id, input.tmdbId),
				with: {
					genres: { with: { genre: true } },
					streamProviders: { with: { provider: true } },
					buyProviders: { with: { provider: true } },
					rentProviders: { with: { provider: true } },
				},
			});

			const isStale =
				!existing || Date.now() - existing.updatedAt.getTime() > STALE_AFTER_MS;

			const movie = isStale ? await refreshMovie(ctx, input.tmdbId) : existing;

			if (!movie) {
				throw new TRPCError({ code: "NOT_FOUND", message: "Movie not found" });
			}

			let inWatchlist = false;
			if (ctx.session?.user) {
				const entry = await ctx.db.query.watchlistEntries.findFirst({
					where: and(
						eq(schema.watchlistEntries.userId, ctx.session.user.id),
						eq(schema.watchlistEntries.movieId, movie.id),
					),
				});
				inWatchlist = Boolean(entry);
			}

			let matches: { id: string; name: string | null; image: string | null }[] =
				[];
			if (ctx.session?.user) {
				const result = await ctx.db
					.select({
						id: schema.users.id,
						name: schema.users.name,
						image: schema.users.image,
					})
					.from(schema.watchlistEntries)
					.innerJoin(
						schema.follows,
						and(
							eq(schema.follows.followerId, ctx.session.user.id),
							eq(schema.follows.followingId, schema.watchlistEntries.userId),
						),
					)
					.innerJoin(
						schema.users,
						eq(schema.users.id, schema.watchlistEntries.userId),
					)
					.where(eq(schema.watchlistEntries.movieId, movie.id));
				matches = result;
			}

			return { ...movie, inWatchlist, matches };
		}),

	getForYou: protectedProcedure
		.input(
			z.object({
				limit: z.number().default(20),
				offset: z.number().default(0),
			}),
		)
		.query(async ({ ctx, input }) => {
			const userId = ctx.session.user.id;

			const movies = await ctx.db
				.select({
					id: schema.movies.id,
					title: schema.movies.title,
					posterPath: schema.movies.posterPath,
					releaseDate: schema.movies.releaseDate,
					friendCount: count(schema.follows.followingId),
				})
				.from(schema.follows)
				.innerJoin(
					schema.watchlistEntries,
					eq(schema.watchlistEntries.userId, schema.follows.followingId),
				)
				.innerJoin(
					schema.movies,
					eq(schema.movies.id, schema.watchlistEntries.movieId),
				)
				.where(eq(schema.follows.followerId, userId))
				.groupBy(schema.movies.id)
				.orderBy(desc(count(schema.follows.followingId)))
				.limit(input.limit)
				.offset(input.offset);

			// Exclude movies already in user's watchlist
			const watchlistSet = await getWatchlistSet(
				ctx,
				movies.map((m) => m.id),
			);

			return movies
				.filter((m) => !watchlistSet.has(m.id))
				.map((m) => ({
					...m,
					inWatchlist: false,
				}));
		}),

	getGenreById: publicProcedure
		.input(z.object({ id: z.number() }))
		.query(async ({ ctx, input }) => {
			const genre = await ctx.db.query.genres.findFirst({
				where: eq(schema.genres.id, input.id),
			});
			if (!genre) {
				throw new TRPCError({ code: "NOT_FOUND", message: "Genre not found" });
			}
			return genre;
		}),

	getGenres: publicProcedure.query(({ ctx }) =>
		ctx.db.select().from(schema.genres),
	),

	getPopular: publicProcedure
		.input(
			z.object({
				limit: z.number().default(20),
				offset: z.number().default(0),
			}),
		)
		.query(async ({ ctx, input }) => {
			const movies = await ctx.db
				.select({
					id: schema.movies.id,
					title: schema.movies.title,
					posterPath: schema.movies.posterPath,
					releaseDate: schema.movies.releaseDate,
					watchlistCount: count(schema.watchlistEntries.userId),
				})
				.from(schema.movies)
				.innerJoin(
					schema.watchlistEntries,
					eq(schema.watchlistEntries.movieId, schema.movies.id),
				)
				.groupBy(schema.movies.id)
				.orderBy(
					desc(count(schema.watchlistEntries.userId)),
					desc(schema.movies.id),
				)
				.limit(input.limit)
				.offset(input.offset);

			const watchlistSet = await getWatchlistSet(
				ctx,
				movies.map((m) => m.id),
			);

			return movies.map((m) => ({
				...m,
				inWatchlist: watchlistSet.has(m.id),
			}));
		}),

	search: publicProcedure
		.input(z.object({ query: z.string().min(1), page: z.number().default(1) }))
		.query(async ({ ctx, input }) => {
			const tmdbResults = await ctx.tmdb.search.movies({
				query: input.query,
				page: input.page,
			});

			const movieIds: number[] = [];
			for (const result of tmdbResults.results) {
				await ctx.db
					.insert(schema.movies)
					.values({
						id: result.id,
						title: result.title,
						originalTitle: result.original_title ?? null,
						overview: result.overview ?? null,
						posterPath: result.poster_path ?? null,
						backdropPath: result.backdrop_path ?? null,
						releaseDate: result.release_date ?? null,
						adult: result.adult ?? false,
						popularity: result.popularity ?? null,
					})
					.onConflictDoNothing();
				movieIds.push(result.id);
			}

			const watchlistSet = new Set<number>();
			if (ctx.session?.user && movieIds.length > 0) {
				const entries = await ctx.db
					.select({ movieId: schema.watchlistEntries.movieId })
					.from(schema.watchlistEntries)
					.where(
						and(
							eq(schema.watchlistEntries.userId, ctx.session.user.id),
							sql`${schema.watchlistEntries.movieId} IN ${movieIds}`,
						),
					);
				for (const e of entries) {
					watchlistSet.add(e.movieId);
				}
			}

			return {
				results: tmdbResults.results.map((r) => ({
					id: r.id,
					title: r.title,
					posterPath: r.poster_path,
					releaseDate: r.release_date,
					overview: r.overview,
					inWatchlist: watchlistSet.has(r.id),
				})),
				page: tmdbResults.page,
				totalPages: tmdbResults.total_pages,
				totalResults: tmdbResults.total_results,
			};
		}),
});

async function refreshMovie(
	ctx: {
		db: import("@miru/db").Database;
		tmdb: import("@lorenzopant/tmdb").TMDB;
	},
	tmdbId: number,
) {
	try {
		const [details, videos, watchProviders] = await Promise.all([
			ctx.tmdb.movies.details({ movie_id: tmdbId }),
			ctx.tmdb.movies.videos({ movie_id: tmdbId }),
			ctx.tmdb.movies.watch_providers({ movie_id: tmdbId }),
		]);

		const trailer = videos.results?.filter(
			(v) => v.site === "YouTube" && v.type === "Trailer",
		)?.[0];

		// Upsert movie
		await ctx.db
			.insert(schema.movies)
			.values({
				adult: details.adult ?? false,
				backdropPath: details.backdrop_path ?? null,
				budget: details.budget ?? null,
				homepage: details.homepage ?? null,
				id: details.id,
				imdbId: details.imdb_id ?? null,
				originalTitle: details.original_title ?? null,
				overview: details.overview ?? null,
				popularity: details.popularity ?? null,
				posterPath: details.poster_path ?? null,
				releaseDate: details.release_date ?? null,
				revenue: details.revenue ?? null,
				runtime: details.runtime ?? null,
				tagline: details.tagline ?? null,
				title: details.title,
				tmdbVoteAverage: details.vote_average ?? null,
				tmdbVoteCount: details.vote_count ?? null,
				trailerKey: trailer?.key ?? null,
				trailerSite: trailer?.site ?? null,
				updatedAt: new Date(),
			})
			.onConflictDoUpdate({
				set: {
					title: details.title,
					originalTitle: details.original_title ?? null,
					overview: details.overview ?? null,
					posterPath: details.poster_path ?? null,
					backdropPath: details.backdrop_path ?? null,
					releaseDate: details.release_date ?? null,
					adult: details.adult ?? false,
					popularity: details.popularity ?? null,
					budget: details.budget ?? null,
					revenue: details.revenue ?? null,
					runtime: details.runtime ?? null,
					tagline: details.tagline ?? null,
					homepage: details.homepage ?? null,
					imdbId: details.imdb_id ?? null,
					tmdbVoteAverage: details.vote_average ?? null,
					tmdbVoteCount: details.vote_count ?? null,
					trailerKey: trailer?.key ?? null,
					trailerSite: trailer?.site ?? null,
					updatedAt: new Date(),
				},
				target: schema.movies.id,
			});

		// Upsert genres
		if (details.genres?.length) {
			for (const g of details.genres) {
				await ctx.db
					.insert(schema.genres)
					.values({ id: g.id, name: g.name })
					.onConflictDoNothing();
				await ctx.db
					.insert(schema.movieGenres)
					.values({ genreId: g.id, movieId: details.id })
					.onConflictDoNothing();
			}
		}

		// Upsert watch providers (GB region)
		const gbProviders = (
			watchProviders.results as Record<
				string,
				{
					flatrate?: {
						provider_id: number;
						provider_name: string;
						logo_path: string;
						display_priority: number;
					}[];
					buy?: {
						provider_id: number;
						provider_name: string;
						logo_path: string;
						display_priority: number;
					}[];
					rent?: {
						provider_id: number;
						provider_name: string;
						logo_path: string;
						display_priority: number;
					}[];
				}
			>
		)?.["GB"];

		if (gbProviders) {
			await upsertProviders(
				ctx.db,
				details.id,
				gbProviders.flatrate ?? [],
				"stream",
			);
			await upsertProviders(ctx.db, details.id, gbProviders.buy ?? [], "buy");
			await upsertProviders(ctx.db, details.id, gbProviders.rent ?? [], "rent");
		}

		return ctx.db.query.movies.findFirst({
			where: eq(schema.movies.id, tmdbId),
			with: {
				buyProviders: { with: { provider: true } },
				genres: { with: { genre: true } },
				rentProviders: { with: { provider: true } },
				streamProviders: { with: { provider: true } },
			},
		});
	} catch {
		// If TMDB is down, return stale data from DB
		return ctx.db.query.movies.findFirst({
			where: eq(schema.movies.id, tmdbId),
			with: {
				buyProviders: { with: { provider: true } },
				genres: { with: { genre: true } },
				rentProviders: { with: { provider: true } },
				streamProviders: { with: { provider: true } },
			},
		});
	}
}

async function upsertProviders(
	db: import("@miru/db").Database,
	movieId: number,
	providers: {
		provider_id: number;
		provider_name: string;
		logo_path: string;
		display_priority: number;
	}[],
	type: "stream" | "buy" | "rent",
) {
	const junctionTables = {
		stream: schema.movieStreamProviders,
		buy: schema.movieBuyProviders,
		rent: schema.movieRentProviders,
	} as const;
	const junctionTable = junctionTables[type];

	for (const p of providers) {
		await db
			.insert(schema.watchProviders)
			.values({
				displayPriority: p.display_priority,
				id: p.provider_id,
				logoPath: p.logo_path,
				name: p.provider_name,
			})
			.onConflictDoNothing();

		await db
			.insert(junctionTable)
			.values({ movieId, providerId: p.provider_id })
			.onConflictDoNothing();
	}
}

async function getWatchlistSet(
	ctx: {
		db: import("@miru/db").Database;
		session: { user: { id: string } } | null;
	},
	movieIds: number[],
): Promise<Set<number>> {
	if (!ctx.session?.user || movieIds.length === 0) {
		return new Set();
	}

	const entries = await ctx.db
		.select({ movieId: schema.watchlistEntries.movieId })
		.from(schema.watchlistEntries)
		.where(
			and(
				eq(schema.watchlistEntries.userId, ctx.session.user.id),
				sql`${schema.watchlistEntries.movieId} IN ${movieIds}`,
			),
		);

	return new Set(entries.map((e) => e.movieId));
}
