import { type Database, schema } from "@miru/db";
import type { TMDBClient } from "../tmdb";
import { TRPCError } from "@trpc/server";
import { and, count, desc, eq, inArray } from "drizzle-orm";
import { z } from "zod";
import { protectedProcedure, publicProcedure, router } from "../trpc";
import {
	computeUserGenreWeights,
	diversityRerank,
	enrichExplanations,
	findSimilarUsers,
	getRecommendedMovies,
	selectExplanation,
} from "./recommendation-engine";

const STALE_AFTER_MS = 24 * 60 * 60 * 1000; // 24 hours
const GENRES_CACHE_MS = 7 * 24 * 60 * 60 * 1000; // 7 days
const DEFAULT_PAGE_SIZE = 20;
const DEFAULT_REGION = "GB";
const TRAILER_SITE = "YouTube";
const TRAILER_TYPE = "Trailer";

let genresCache: { data: { id: number; name: string }[]; ts: number } | null =
	null;

const movieWithProvidersQuery = {
	genres: { with: { genre: true } },
	streamProviders: { with: { provider: true } },
} as const;

export const movieRouter = router({
	getByGenre: publicProcedure
		.input(
			z.object({
				cursor: z.number().nullish(),
				genreId: z.number(),
			}),
		)
		.query(async ({ ctx, input }) => {
			const offset = input.cursor ?? 0;
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
				.where(
					and(
						eq(schema.movieGenres.genreId, input.genreId),
						eq(schema.movies.adult, false),
					),
				)
				.orderBy(desc(schema.movies.tmdbVoteCount))
				.limit(DEFAULT_PAGE_SIZE)
				.offset(offset);

			const movieIds = movies.map((m) => m.id);
			const [watchlistSet, watchedSet] = await Promise.all([
				getMovieIdSet(ctx, schema.watchlistEntries, movieIds),
				getMovieIdSet(ctx, schema.watchedEntries, movieIds),
			]);

			return movies.map((m) => ({
				...m,
				inWatchlist: watchlistSet.has(m.id),
				isWatched: watchedSet.has(m.id),
			}));
		}),

	getById: publicProcedure
		.input(z.object({ tmdbId: z.number() }))
		.query(async ({ ctx, input }) => {
			const existing = await ctx.db.query.movies.findFirst({
				where: eq(schema.movies.id, input.tmdbId),
				with: movieWithProvidersQuery,
			});

			const isStale =
				!existing ||
				Date.now() - existing.updatedAt.getTime() > STALE_AFTER_MS ||
				existing.runtime === null;

			const movie = isStale
				? await refreshMovie(
						ctx,
						input.tmdbId,
						ctx.session?.user?.country ?? undefined,
					)
				: existing;

			if (!movie) {
				throw new TRPCError({ code: "NOT_FOUND", message: "Movie not found" });
			}

			let inWatchlist = false;
			let isWatched = false;
			let matches: { id: string; name: string | null; image: string | null }[] =
				[];

			if (ctx.session?.user) {
				const userId = ctx.session.user.id;

				const [entry, watchedEntry, friendMatches, friendsWhoWatched] =
					await Promise.all([
						ctx.db.query.watchlistEntries.findFirst({
							where: and(
								eq(schema.watchlistEntries.userId, userId),
								eq(schema.watchlistEntries.movieId, movie.id),
							),
						}),
						ctx.db.query.watchedEntries.findFirst({
							where: and(
								eq(schema.watchedEntries.userId, userId),
								eq(schema.watchedEntries.movieId, movie.id),
							),
						}),
						ctx.db
							.select({
								id: schema.users.id,
								name: schema.users.name,
								image: schema.users.image,
							})
							.from(schema.watchlistEntries)
							.innerJoin(
								schema.follows,
								and(
									eq(schema.follows.followerId, userId),
									eq(
										schema.follows.followingId,
										schema.watchlistEntries.userId,
									),
								),
							)
							.innerJoin(
								schema.users,
								eq(schema.users.id, schema.watchlistEntries.userId),
							)
							.where(eq(schema.watchlistEntries.movieId, movie.id)),
						ctx.db
							.select({ userId: schema.watchedEntries.userId })
							.from(schema.watchedEntries)
							.where(eq(schema.watchedEntries.movieId, movie.id)),
					]);

				inWatchlist = Boolean(entry);
				isWatched = Boolean(watchedEntry);

				// Only show friends who haven't watched this movie yet
				const watchedByFriendSet = new Set(
					friendsWhoWatched.map((f) => f.userId),
				);
				matches = friendMatches.filter((f) => !watchedByFriendSet.has(f.id));
			}

			return { ...movie, inWatchlist, isWatched, matches };
		}),

	getForYou: protectedProcedure
		.input(
			z.object({
				cursor: z.number().nullish(),
				limit: z.number().default(DEFAULT_PAGE_SIZE),
			}),
		)
		.query(async ({ ctx, input }) => {
			const userId = ctx.session.user.id;
			const offset = input.cursor ?? 0;

			// Gather user context in parallel
			const [
				existingWatchlist,
				existingWatched,
				genreWeights,
				userStreamingServices,
			] = await Promise.all([
				ctx.db
					.select({ movieId: schema.watchlistEntries.movieId })
					.from(schema.watchlistEntries)
					.where(eq(schema.watchlistEntries.userId, userId)),
				ctx.db
					.select({ movieId: schema.watchedEntries.movieId })
					.from(schema.watchedEntries)
					.where(eq(schema.watchedEntries.userId, userId)),
				computeUserGenreWeights(ctx.db, userId),
				ctx.db
					.select({ providerId: schema.userStreamingServices.providerId })
					.from(schema.userStreamingServices)
					.where(eq(schema.userStreamingServices.userId, userId)),
			]);

			const userMovieIds = [
				...existingWatchlist.map((e) => e.movieId),
				...existingWatched.map((e) => e.movieId),
			];
			const excludeIds = [...userMovieIds];
			const userStreamingProviderIds = userStreamingServices.map(
				(s) => s.providerId,
			);

			// Find similar users for collaborative filtering
			const similarUsers = await findSimilarUsers(
				ctx.db,
				userId,
				userMovieIds,
			);

			// Get all scored candidates
			const scoredMovies = await getRecommendedMovies(
				ctx.db,
				userId,
				genreWeights,
				similarUsers,
				excludeIds,
				userStreamingProviderIds,
			);

			// Fetch genres for diversity reranking
			const candidateIds = scoredMovies.map((m) => m.id);
			const movieGenreRows =
				candidateIds.length > 0
					? await ctx.db
							.select({
								movieId: schema.movieGenres.movieId,
								genreId: schema.movieGenres.genreId,
							})
							.from(schema.movieGenres)
							.where(inArray(schema.movieGenres.movieId, candidateIds))
						: [];

			const movieGenreMap = new Map<number, number[]>();
			for (const row of movieGenreRows) {
				const existing = movieGenreMap.get(row.movieId) ?? [];
				existing.push(row.genreId);
				movieGenreMap.set(row.movieId, existing);
			}

			// Diversity re-rank the full list, then paginate
			const reranked = diversityRerank(
				scoredMovies,
				movieGenreMap,
				genreWeights,
				scoredMovies.length,
			);

			const page = reranked.slice(offset, offset + input.limit);

			// Select explanations
			const results = page.map((m) => ({
				id: m.id,
				title: m.title,
				posterPath: m.posterPath,
				releaseDate: m.releaseDate,
				friendCount: m.friendCount,
				inWatchlist: false as const,
				isWatched: false as const,
				reason: selectExplanation(m),
			}));

			// Enrich explanations (fills in "because you watched X" titles, provider names)
			await enrichExplanations(ctx.db, userId, results);

			return results;
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

	getGenres: publicProcedure.query(async ({ ctx }) => {
		if (genresCache && Date.now() - genresCache.ts < GENRES_CACHE_MS) {
			return genresCache.data;
		}

		let genres = await ctx.db.select().from(schema.genres);

		if (genres.length === 0) {
			try {
				const response = await ctx.tmdb.genres.movie_list({ language: "en" });
				const tmdbGenres = (response.genres ?? [])
					.map((genre) => ({ id: genre.id, name: genre.name }))
					.filter((genre) => Boolean(genre.name));

				if (tmdbGenres.length > 0) {
					await ctx.db
						.insert(schema.genres)
						.values(tmdbGenres)
						.onConflictDoNothing();
					genres = await ctx.db.select().from(schema.genres);
				}
			} catch {
				// Ignore TMDB errors and return whatever is currently in the DB.
			}
		}

		genres.sort((a, b) => a.name.localeCompare(b.name));
		genresCache = { data: genres, ts: Date.now() };
		return genres;
	}),

	getWatchProviders: publicProcedure.query(({ ctx }) => {
		return ctx.db
			.select()
			.from(schema.watchProviders)
			.orderBy(schema.watchProviders.displayPriority);
	}),

	getPopular: publicProcedure
		.input(
			z.object({
				cursor: z.number().nullish(),
				limit: z.number().default(DEFAULT_PAGE_SIZE),
				providerIds: z.array(z.number()).optional(),
			}),
		)
		.query(async ({ ctx, input }) => {
			const offset = input.cursor ?? 0;

			let query = ctx.db
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
				);

			if (input.providerIds && input.providerIds.length > 0) {
				query = query.innerJoin(
					schema.movieStreamProviders,
					and(
						eq(schema.movieStreamProviders.movieId, schema.movies.id),
						inArray(schema.movieStreamProviders.providerId, input.providerIds),
					),
				) as typeof query;
			}

			const movies = await query
				.where(eq(schema.movies.adult, false))
				.groupBy(schema.movies.id)
				.orderBy(
					desc(count(schema.watchlistEntries.userId)),
					desc(schema.movies.id),
				)
				.limit(input.limit)
				.offset(offset);

			const popularMovieIds = movies.map((m) => m.id);
			const [watchlistSet, watchedSet] = await Promise.all([
				getMovieIdSet(ctx, schema.watchlistEntries, popularMovieIds),
				getMovieIdSet(ctx, schema.watchedEntries, popularMovieIds),
			]);

			return movies.map((m) => ({
				...m,
				inWatchlist: watchlistSet.has(m.id),
				isWatched: watchedSet.has(m.id),
			}));
		}),

	search: publicProcedure
		.input(
			z.object({
				query: z.string().min(1),
				cursor: z.number().nullish(),
				year: z.number().optional(),
				genres: z.array(z.number()).optional(),
			}),
		)
		.query(async ({ ctx, input }) => {
			const page = input.cursor ?? 1;
			const tmdbResults = await ctx.tmdb.search.movies({
				query: input.query,
				page,
				include_adult: false,
				...(input.year ? { year: String(input.year) } : {}),
			});

			let safeResults = tmdbResults.results.filter((r) => !r.adult);

			if (input.genres?.length) {
				const genreSet = new Set(input.genres);
				safeResults = safeResults.filter((r) =>
					r.genre_ids.some((gid: number) => genreSet.has(gid)),
				);
			}

			const movieIds = safeResults.map((r) => r.id);

			if (movieIds.length > 0) {
				await ctx.db
					.insert(schema.movies)
					.values(
						safeResults.map((result) => ({
							id: result.id,
							title: result.title,
							originalTitle: result.original_title ?? null,
							overview: result.overview ?? null,
							posterPath: result.poster_path ?? null,
							backdropPath: result.backdrop_path ?? null,
							releaseDate: result.release_date ?? null,
							adult: false,
							popularity: result.popularity ?? null,
						})),
					)
					.onConflictDoNothing();
			}

			const [watchlistSet, watchedSet] = await Promise.all([
				getMovieIdSet(ctx, schema.watchlistEntries, movieIds),
				getMovieIdSet(ctx, schema.watchedEntries, movieIds),
			]);

			return {
				results: safeResults.map((r) => ({
					id: r.id,
					title: r.title,
					posterPath: r.poster_path,
					releaseDate: r.release_date,
					overview: r.overview,
					inWatchlist: watchlistSet.has(r.id),
					isWatched: watchedSet.has(r.id),
				})),
				page: tmdbResults.page,
				totalPages: tmdbResults.total_pages,
				totalResults: tmdbResults.total_results,
			};
		}),

	searchAutocomplete: publicProcedure
		.input(z.object({ query: z.string().min(1) }))
		.query(async ({ ctx, input }) => {
			const tmdbResults = await ctx.tmdb.search.movies({
				query: input.query,
				page: 1,
				include_adult: false,
			});

			return tmdbResults.results
				.filter((r) => !r.adult)
				.sort((a, b) => (b.popularity ?? 0) - (a.popularity ?? 0))
				.slice(0, 5)
				.map((r) => ({
					id: r.id,
					title: r.title,
					posterPath: r.poster_path,
					releaseDate: r.release_date,
				}));
		}),

	discover: publicProcedure
		.input(
			z.object({
				cursor: z.number().nullish(),
				genres: z.array(z.number()).optional(),
				yearGte: z.number().min(1900).max(2100).optional(),
				yearLte: z.number().min(1900).max(2100).optional(),
				sortBy: z
					.enum([
						"popularity.desc",
						"popularity.asc",
						"primary_release_date.desc",
						"primary_release_date.asc",
					])
					.default("popularity.desc"),
			}),
		)
		.query(async ({ ctx, input }) => {
			const page = input.cursor ?? 1;

			const data = await ctx.tmdb.discoverMovies({
				genres: input.genres,
				yearGte: input.yearGte,
				yearLte: input.yearLte,
				sortBy: input.sortBy,
				page,
			});

			const safeResults = data.results.filter((r) => !r.adult);
			const movieIds = safeResults.map((r) => r.id);

			if (movieIds.length > 0) {
				await ctx.db
					.insert(schema.movies)
					.values(
						safeResults.map((result) => ({
							id: result.id,
							title: result.title,
							originalTitle: result.original_title ?? null,
							overview: result.overview ?? null,
							posterPath: result.poster_path ?? null,
							backdropPath: result.backdrop_path ?? null,
							releaseDate: result.release_date ?? null,
							adult: false,
							popularity: result.popularity ?? null,
						})),
					)
					.onConflictDoNothing();
			}

			const [watchlistSet, watchedSet] = await Promise.all([
				getMovieIdSet(ctx, schema.watchlistEntries, movieIds),
				getMovieIdSet(ctx, schema.watchedEntries, movieIds),
			]);

			return {
				results: safeResults.map((r) => ({
					id: r.id,
					title: r.title,
					posterPath: r.poster_path,
					releaseDate: r.release_date,
					overview: r.overview,
					inWatchlist: watchlistSet.has(r.id),
					isWatched: watchedSet.has(r.id),
				})),
				page: data.page,
				totalPages: data.total_pages,
				totalResults: data.total_results,
			};
		}),
});

function findMovieWithProviders(db: Database, tmdbId: number) {
	return db.query.movies.findFirst({
		where: eq(schema.movies.id, tmdbId),
		with: movieWithProvidersQuery,
	});
}

interface TMDBProvider {
	provider_id: number;
	provider_name: string;
	logo_path: string;
	display_priority: number;
}

interface TMDBRegionProviders {
	flatrate?: TMDBProvider[];
	buy?: TMDBProvider[];
	rent?: TMDBProvider[];
}

async function refreshMovie(
	ctx: { db: Database; tmdb: TMDBClient },
	tmdbId: number,
	country?: string,
) {
	try {
		const [details, videos, watchProviders] = await Promise.all([
			ctx.tmdb.movies.details({ movie_id: tmdbId }),
			ctx.tmdb.movies.videos({ movie_id: tmdbId }),
			ctx.tmdb.movies.watch_providers({ movie_id: tmdbId }),
		]);

		const trailer = videos.results?.find(
			(v) => v.site === TRAILER_SITE && v.type === TRAILER_TYPE,
		);

		const movieData = {
			adult: details.adult ?? false,
			backdropPath: details.backdrop_path ?? null,
			budget: details.budget ?? null,
			homepage: details.homepage ?? null,
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
		};

		await ctx.db
			.insert(schema.movies)
			.values({ id: details.id, ...movieData })
			.onConflictDoUpdate({
				set: movieData,
				target: schema.movies.id,
			});

		if (details.genres?.length) {
			await ctx.db
				.insert(schema.genres)
				.values(details.genres.map((g) => ({ id: g.id, name: g.name })))
				.onConflictDoNothing();
			await ctx.db
				.insert(schema.movieGenres)
				.values(
					details.genres.map((g) => ({
						genreId: g.id,
						movieId: details.id,
					})),
				)
				.onConflictDoNothing();
		}

		const region = country ?? DEFAULT_REGION;
		const regionProviders = (
			watchProviders.results as Record<string, TMDBRegionProviders>
		)?.[region];

		if (regionProviders) {
			await upsertProviders(ctx.db, details.id, regionProviders.flatrate ?? []);
		}

		return findMovieWithProviders(ctx.db, tmdbId);
	} catch {
		// If TMDB is down, return stale data from DB
		return findMovieWithProviders(ctx.db, tmdbId);
	}
}

async function upsertProviders(
	db: Database,
	movieId: number,
	providers: TMDBProvider[],
) {
	if (providers.length === 0) {
		return;
	}

	await db
		.insert(schema.watchProviders)
		.values(
			providers.map((p) => ({
				displayPriority: p.display_priority,
				id: p.provider_id,
				logoPath: p.logo_path,
				name: p.provider_name,
			})),
		)
		.onConflictDoNothing();

	await db
		.insert(schema.movieStreamProviders)
		.values(providers.map((p) => ({ movieId, providerId: p.provider_id })))
		.onConflictDoNothing();
}

async function getMovieIdSet(
	ctx: { db: Database; session: { user: { id: string } } | null },
	table: typeof schema.watchlistEntries | typeof schema.watchedEntries,
	movieIds: number[],
): Promise<Set<number>> {
	if (!ctx.session?.user || movieIds.length === 0) {
		return new Set();
	}

	const entries = await ctx.db
		.select({ movieId: table.movieId })
		.from(table)
		.where(
			and(
				eq(table.userId, ctx.session.user.id),
				inArray(table.movieId, movieIds),
			),
		);

	return new Set(entries.map((e) => e.movieId));
}
