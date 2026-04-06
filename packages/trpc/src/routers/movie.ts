import { TTL, keys } from "@miru/cache";
import { endOfYear, formatISO, startOfYear } from "date-fns";
import {
	type Database,
	compareWatchProviders,
	getWatchProviderUrl,
	mergeWatchProviders,
	normalizeWatchProvider,
	normalizeWatchProviderIds,
	schema,
} from "@miru/db";
import { TMDBError } from "@lorenzopant/tmdb";
import { TRPCError } from "@trpc/server";
import {
	and,
	count,
	desc,
	eq,
	gt,
	gte,
	inArray,
	isNotNull,
	lte,
	notInArray,
} from "drizzle-orm";
import { z } from "zod";
import { BLOCKED_KEYWORDS_PARAM, hasBlockedKeyword } from "../blocked-keywords";
import { getBlockedUserIds, getMovieStatuses } from "../helpers";
import type { TMDB } from "@lorenzopant/tmdb";
import { protectedProcedure, publicProcedure, router } from "../trpc";
import {
	computeUserGenreWeights,
	diversityRerank,
	enrichExplanations,
	findSimilarUsers,
	getPlatformPopularMovies,
	getRecommendedMovies,
	selectExplanation,
} from "./recommendation-engine";

const STALE_AFTER_MS = 24 * 60 * 60 * 1000; // 24 hours
const DEFAULT_PAGE_SIZE = 20;
const DEFAULT_REGION = "GB";
const TRAILER_SITE = "YouTube";
const TRAILER_TYPE = "Trailer";
const DISCOVER_SECTION_LIMIT = 15;

const ADDON_CHANNEL_PATTERN = /Amazon Channel|Apple TV Channel/i;

function isAddonChannel(name: string) {
	return ADDON_CHANNEL_PATTERN.test(name);
}

const movieWithProvidersQuery = {
	genres: { with: { genre: true } },
	streamProviders: { with: { provider: true } },
} as const;

function normalizeMovieProviders<
	T extends {
		title: string;
		streamProviders: Array<{
			provider: {
				displayPriority: number | null;
				id: number;
				logoPath: string | null;
				name: string;
			};
		}>;
	},
>(
	movie: T,
): Omit<T, "streamProviders"> & {
	streamProviders: Array<T["streamProviders"][number] & { url: string | null }>;
} {
	const streamProviders = movie.streamProviders
		.map((streamProvider) => ({
			...streamProvider,
			provider: normalizeWatchProvider(streamProvider.provider),
			url: getWatchProviderUrl(streamProvider.provider.id, movie.title),
		}))
		.filter((streamProvider, index, providers) => {
			return (
				providers.findIndex(
					(provider) => provider.provider.id === streamProvider.provider.id,
				) === index
			);
		})
		.sort((a, b) => compareWatchProviders(a.provider, b.provider));

	return {
		...movie,
		streamProviders,
	} as Omit<T, "streamProviders"> & {
		streamProviders: Array<
			T["streamProviders"][number] & { url: string | null }
		>;
	};
}

type MovieMatchUser = {
	id: string;
	image: string | null;
	name: string | null;
};

interface MovieUserContext {
	inWatchlist: boolean;
	isWatched: boolean;
	matches: MovieMatchUser[];
}

async function fetchMovieUserContext(
	db: Database,
	userId: string,
	movieId: number,
): Promise<MovieUserContext> {
	const [entry, watchedEntry, friendMatches, friendsWhoWatched, blockedIds] =
		await Promise.all([
			db.query.watchlistEntries.findFirst({
				where: and(
					eq(schema.watchlistEntries.userId, userId),
					eq(schema.watchlistEntries.movieId, movieId),
				),
			}),
			db.query.watchedEntries.findFirst({
				where: and(
					eq(schema.watchedEntries.userId, userId),
					eq(schema.watchedEntries.movieId, movieId),
				),
			}),
			db
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
						eq(schema.follows.followingId, schema.watchlistEntries.userId),
					),
				)
				.innerJoin(
					schema.users,
					eq(schema.users.id, schema.watchlistEntries.userId),
				)
				.where(eq(schema.watchlistEntries.movieId, movieId)),
			db
				.select({ userId: schema.watchedEntries.userId })
				.from(schema.watchedEntries)
				.where(eq(schema.watchedEntries.movieId, movieId)),
			getBlockedUserIds(db, userId),
		]);

	const watchedByFriendSet = new Set(friendsWhoWatched.map((f) => f.userId));

	return {
		inWatchlist: Boolean(entry),
		isWatched: Boolean(watchedEntry),
		matches: friendMatches.filter(
			(f) => !watchedByFriendSet.has(f.id) && !blockedIds.has(f.id),
		),
	};
}

export const movieRouter = router({
	getByGenre: publicProcedure
		.input(
			z.object({
				cursor: z.number().int().min(0).nullish(),
				genreId: z.number().int().positive(),
				limit: z.number().int().positive().max(100).default(DEFAULT_PAGE_SIZE),
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
				.orderBy(desc(schema.movies.tmdbVoteCount), desc(schema.movies.id))
				.limit(input.limit)
				.offset(offset);

			const movieIds = movies.map((m) => m.id);
			const { watchlistSet, watchedSet } = await getMovieStatuses(
				ctx,
				movieIds,
			);

			return movies.map((m) => ({
				...m,
				inWatchlist: watchlistSet.has(m.id),
				isWatched: watchedSet.has(m.id),
			}));
		}),

	getById: publicProcedure
		.input(z.object({ tmdbId: z.number().int().positive() }))
		.query(async ({ ctx, input }) => {
			const existing = await ctx.db.query.movies.findFirst({
				where: eq(schema.movies.id, input.tmdbId),
				with: movieWithProvidersQuery,
			});

			const isStale =
				!existing ||
				Date.now() - existing.updatedAt.getTime() > STALE_AFTER_MS ||
				existing.runtime === null;

			const moviePromise = isStale
				? refreshMovie(
						ctx,
						input.tmdbId,
						ctx.session?.user?.country ?? undefined,
					)
				: Promise.resolve(existing ? normalizeMovieProviders(existing) : null);
			const userContextPromise = ctx.session?.user
				? fetchMovieUserContext(ctx.db, ctx.session.user.id, input.tmdbId)
				: Promise.resolve(null);
			const [movie, userContext] = await Promise.all([
				moviePromise,
				userContextPromise,
			]);

			if (!movie || movie.adult) {
				throw new TRPCError({ code: "NOT_FOUND", message: "Movie not found" });
			}

			const { inWatchlist, isWatched, matches } = userContext ?? {
				inWatchlist: false,
				isWatched: false,
				matches: [],
			};

			return { ...movie, inWatchlist, isWatched, matches };
		}),

	getForYou: protectedProcedure
		.input(
			z.object({
				cursor: z.number().int().min(0).nullish(),
				limit: z.number().int().min(1).max(100).default(DEFAULT_PAGE_SIZE),
			}),
		)
		.query(async ({ ctx, input }) => {
			const userId = ctx.session.user.id;
			const offset = input.cursor ?? 0;

			async function computeRecommendations() {
				const platformPopularPromise = ctx.cache
					? ctx.cache.getOrSet(
							keys.recommendationPlatformPopular(),
							TTL.RECOMMENDATION_PLATFORM_POPULAR,
							() => getPlatformPopularMovies(ctx.db),
						)
					: getPlatformPopularMovies(ctx.db);

				const [
					existingWatchlist,
					existingWatched,
					genreWeights,
					userStreamingServices,
					platformPopular,
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
					platformPopularPromise,
				]);

				const userMovieIds = [
					...existingWatchlist.map((e) => e.movieId),
					...existingWatched.map((e) => e.movieId),
				];
				const userStreamingProviderIds = normalizeWatchProviderIds(
					userStreamingServices.map((service) => service.providerId),
				);

				const similarUsers = await findSimilarUsers(
					ctx.db,
					userId,
					userMovieIds,
				);

				const { movieGenreMap, movies: scoredMovies } =
					await getRecommendedMovies(
						ctx.db,
						userId,
						genreWeights,
						similarUsers,
						userMovieIds,
						userStreamingProviderIds,
						platformPopular,
					);

				return diversityRerank(
					scoredMovies,
					movieGenreMap,
					genreWeights,
					scoredMovies.length,
				);
			}

			const reranked = ctx.cache
				? await ctx.cache.getOrSet(
						keys.recommendations(userId),
						TTL.RECOMMENDATIONS,
						computeRecommendations,
					)
				: await computeRecommendations();

			const page = reranked.slice(offset, offset + input.limit);

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

			await enrichExplanations(ctx.db, userId, results);

			return results;
		}),

	getGenreById: publicProcedure
		.input(z.object({ id: z.number().int().positive() }))
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
		async function fetchGenres() {
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
				} catch (error) {
					throw new TRPCError({
						code: "INTERNAL_SERVER_ERROR",
						message: "Unable to load genres. Please try again later.",
						cause: error,
					});
				}
			}

			genres.sort((a, b) => a.name.localeCompare(b.name));
			return genres;
		}

		if (ctx.cache) {
			return ctx.cache.getOrSet(keys.genres(), TTL.GENRES, fetchGenres);
		}
		return fetchGenres();
	}),

	getWatchProviders: publicProcedure
		.input(z.object({ country: z.string().length(2).optional() }).optional())
		.query(async ({ ctx, input }) => {
			const providers = await ctx.db
				.select()
				.from(schema.watchProviders)
				.where(
					inArray(
						schema.watchProviders.id,
						ctx.db
							.select({ providerId: schema.movieStreamProviders.providerId })
							.from(schema.movieStreamProviders),
					),
				)
				.orderBy(schema.watchProviders.displayPriority)
				.then((p) =>
					mergeWatchProviders(p).filter(
						(provider) => !isAddonChannel(provider.name),
					),
				);

			const country = input?.country;
			if (!country) {
				return providers;
			}

			try {
				const tmdbProviders = await ctx.tmdb.watch_providers.movie_providers();
				const regionProviderIds = new Set(
					tmdbProviders.results
						.filter(
							(p) =>
								p.display_priorities[
									country as keyof typeof p.display_priorities
								] !== undefined,
						)
						.map((p) => p.provider_id),
				);
				return providers.filter((p) => regionProviderIds.has(p.id));
			} catch {
				return providers;
			}
		}),

	getPopular: publicProcedure
		.input(
			z.object({
				cursor: z.number().int().min(0).nullish(),
				limit: z.number().int().min(1).max(100).default(DEFAULT_PAGE_SIZE),
				providerIds: z.array(z.number().int().positive()).optional(),
			}),
		)
		.query(async ({ ctx, input }) => {
			const offset = input.cursor ?? 0;
			const providerIds = normalizeWatchProviderIds(input.providerIds ?? []);

			const providerMovieIds =
				providerIds.length > 0
					? ctx.db
							.select({ movieId: schema.movieStreamProviders.movieId })
							.from(schema.movieStreamProviders)
							.where(
								inArray(schema.movieStreamProviders.providerId, providerIds),
							)
					: null;

			const movies = await ctx.db
				.select({
					id: schema.movies.id,
					title: schema.movies.title,
					posterPath: schema.movies.posterPath,
					releaseDate: schema.movies.releaseDate,
					watchlistCount: schema.movies.watchlistCount,
				})
				.from(schema.movies)
				.where(
					and(
						eq(schema.movies.adult, false),
						gt(schema.movies.watchlistCount, 0),
						providerMovieIds
							? inArray(schema.movies.id, providerMovieIds)
							: undefined,
					),
				)
				.orderBy(desc(schema.movies.watchlistCount), desc(schema.movies.id))
				.limit(input.limit)
				.offset(offset);

			const popularMovieIds = movies.map((m) => m.id);
			const { watchlistSet, watchedSet } = await getMovieStatuses(
				ctx,
				popularMovieIds,
			);

			return movies.map((m) => ({
				...m,
				inWatchlist: watchlistSet.has(m.id),
				isWatched: watchedSet.has(m.id),
			}));
		}),

	search: publicProcedure
		.input(
			z.object({
				query: z.string().min(1).max(200),
				cursor: z.number().int().min(1).max(500).nullish(),
				year: z.number().int().min(1900).max(2100).optional(),
				genres: z.array(z.number().int().positive()).optional(),
			}),
		)
		.query(async ({ ctx, input }) => {
			const page = input.cursor ?? 1;

			async function fetchFromTmdb() {
				try {
					return await ctx.tmdb.search.movies({
						query: input.query,
						page,
						include_adult: false,
						...(input.year ? { year: String(input.year) } : {}),
					});
				} catch (error) {
					throw new TRPCError({
						code: "INTERNAL_SERVER_ERROR",
						message:
							"Search is temporarily unavailable. Please try again later.",
						cause: error,
					});
				}
			}

			const tmdbResults = ctx.cache
				? await ctx.cache.getOrSet(
						keys.search(input.query, page),
						TTL.SEARCH,
						fetchFromTmdb,
					)
				: await fetchFromTmdb();

			let safeResults = tmdbResults.results.filter((r) => !r.adult);

			if (input.genres?.length) {
				const genreSet = new Set(input.genres);
				safeResults = safeResults.filter((r) =>
					r.genre_ids.some((gid: number) => genreSet.has(gid)),
				);
			}

			const candidateIds = safeResults.map((r) => r.id);

			if (candidateIds.length > 0) {
				const knownMovies = await ctx.db
					.select({ id: schema.movies.id, adult: schema.movies.adult })
					.from(schema.movies)
					.where(inArray(schema.movies.id, candidateIds));

				const knownMap = new Map(knownMovies.map((m) => [m.id, m.adult]));
				const unknownResults = safeResults.filter((r) => !knownMap.has(r.id));
				const adultIds = new Set(
					knownMovies.filter((m) => m.adult).map((m) => m.id),
				);

				if (unknownResults.length > 0) {
					const settled = await Promise.allSettled(
						unknownResults.map((r) =>
							ctx.tmdb.movies.details({
								movie_id: r.id,
								append_to_response: ["keywords"],
							}),
						),
					);

					const inserts: {
						id: number;
						title: string;
						originalTitle: string | null;
						overview: string | null;
						posterPath: string | null;
						backdropPath: string | null;
						releaseDate: string | null;
						adult: boolean;
						popularity: number | null;
					}[] = [];

					for (const [i, r] of unknownResults.entries()) {
						const result = settled[i];
						const isAdult =
							result?.status === "fulfilled" &&
							hasBlockedKeyword(
								result.value.keywords.keywords,
								result.value.vote_count ?? 0,
							);

						if (isAdult) {
							adultIds.add(r.id);
						}

						inserts.push({
							id: r.id,
							title: r.title,
							originalTitle: r.original_title ?? null,
							overview: r.overview ?? null,
							posterPath: r.poster_path ?? null,
							backdropPath: r.backdrop_path ?? null,
							releaseDate: r.release_date ?? null,
							adult: isAdult,
							popularity: r.popularity ?? null,
						});
					}

					if (inserts.length > 0) {
						try {
							await ctx.db
								.insert(schema.movies)
								.values(inserts)
								.onConflictDoNothing();
						} catch {
							// Best-effort cache; search results are still valid from TMDB
						}
					}
				}

				if (adultIds.size > 0) {
					safeResults = safeResults.filter((r) => !adultIds.has(r.id));
				}
			}

			const movieIds = safeResults.map((r) => r.id);

			const { watchlistSet, watchedSet } = await getMovieStatuses(
				ctx,
				movieIds,
			);

			return {
				results: safeResults.map((r) => ({
					id: r.id,
					title: r.title,
					posterPath: r.poster_path ?? null,
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
			let tmdbResults;
			try {
				tmdbResults = await ctx.tmdb.search.movies({
					query: input.query,
					page: 1,
					include_adult: false,
				});
			} catch (error) {
				throw new TRPCError({
					code: "INTERNAL_SERVER_ERROR",
					message: "Search is temporarily unavailable. Please try again later.",
					cause: error,
				});
			}

			let safeResults = tmdbResults.results.filter((r) => !r.adult);

			const candidateIds = safeResults.map((r) => r.id);
			if (candidateIds.length > 0) {
				const knownMovies = await ctx.db
					.select({ id: schema.movies.id, adult: schema.movies.adult })
					.from(schema.movies)
					.where(inArray(schema.movies.id, candidateIds));

				const knownMap = new Map(knownMovies.map((m) => [m.id, m.adult]));
				const unknownResults = safeResults.filter((r) => !knownMap.has(r.id));
				const adultIds = new Set(
					knownMovies.filter((m) => m.adult).map((m) => m.id),
				);

				if (unknownResults.length > 0) {
					const settled = await Promise.allSettled(
						unknownResults.map((r) =>
							ctx.tmdb.movies.details({
								movie_id: r.id,
								append_to_response: ["keywords"],
							}),
						),
					);

					for (const [i, r] of unknownResults.entries()) {
						const result = settled[i];
						if (
							result?.status === "fulfilled" &&
							hasBlockedKeyword(
								result.value.keywords.keywords,
								result.value.vote_count ?? 0,
							)
						) {
							adultIds.add(r.id);
						}
					}
				}

				if (adultIds.size > 0) {
					safeResults = safeResults.filter((r) => !adultIds.has(r.id));
				}
			}

			return safeResults
				.sort((a, b) => (b.popularity ?? 0) - (a.popularity ?? 0))
				.slice(0, 5)
				.map((r) => ({
					id: r.id,
					title: r.title,
					posterPath: r.poster_path ?? null,
					releaseDate: r.release_date,
				}));
		}),

	getDiscoverSections: publicProcedure.query(async ({ ctx }) => {
		const userId = ctx.session?.user?.id ?? null;

		async function fetchSections() {
			const now = new Date();
			const threeMonthsAgo = new Date(now);
			threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
			const todayStr = now.toISOString().slice(0, 10);
			const threeMonthsAgoStr = threeMonthsAgo.toISOString().slice(0, 10);

			const movieSelect = {
				id: schema.movies.id,
				title: schema.movies.title,
				posterPath: schema.movies.posterPath,
			} as const;

			const [trending, newReleases, popularOnMiruRaw] = await Promise.all([
				ctx.db
					.select(movieSelect)
					.from(schema.movies)
					.where(
						and(
							eq(schema.movies.adult, false),
							isNotNull(schema.movies.posterPath),
						),
					)
					.orderBy(desc(schema.movies.popularity))
					.limit(DISCOVER_SECTION_LIMIT),
				ctx.db
					.select(movieSelect)
					.from(schema.movies)
					.where(
						and(
							eq(schema.movies.adult, false),
							isNotNull(schema.movies.posterPath),
							gte(schema.movies.releaseDate, threeMonthsAgoStr),
							lte(schema.movies.releaseDate, todayStr),
						),
					)
					.orderBy(desc(schema.movies.popularity))
					.limit(DISCOVER_SECTION_LIMIT),
				ctx.db
					.select({
						...movieSelect,
						watchlistCount: schema.movies.watchlistCount,
					})
					.from(schema.movies)
					.where(
						and(
							eq(schema.movies.adult, false),
							gt(schema.movies.watchlistCount, 0),
						),
					)
					.orderBy(desc(schema.movies.watchlistCount), desc(schema.movies.id))
					.limit(DISCOVER_SECTION_LIMIT),
			]);

			return {
				trending,
				newReleases,
				popularOnMiru: popularOnMiruRaw.map(({ watchlistCount: _, ...m }) => m),
			};
		}

		const sections = ctx.cache
			? await ctx.cache.getOrSet(
					keys.discoverSections(),
					TTL.DISCOVER_SECTIONS,
					fetchSections,
				)
			: await fetchSections();

		const friendsWatching = userId
			? await getFriendsWatchingMovies(ctx.db, userId)
			: [];

		return { ...sections, friendsWatching };
	}),

	discover: publicProcedure
		.input(
			z.object({
				cursor: z.number().int().min(1).max(500).nullish(),
				genres: z.array(z.number().int().positive()).optional(),
				yearGte: z.number().int().min(1900).max(2100).optional(),
				yearLte: z.number().int().min(1900).max(2100).optional(),
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

			async function fetchDiscover() {
				try {
					return await ctx.tmdb.discover.movie({
						include_adult: false,
						language: "en-US",
						page,
						sort_by: input.sortBy,
						without_keywords: BLOCKED_KEYWORDS_PARAM,
						...(input.genres?.length && {
							with_genres: input.genres.join(","),
						}),
						...(input.yearGte && {
							"primary_release_date.gte": formatISO(
								startOfYear(new Date(input.yearGte, 0)),
								{ representation: "date" },
							),
						}),
						...(input.yearLte && {
							"primary_release_date.lte": formatISO(
								endOfYear(new Date(input.yearLte, 0)),
								{ representation: "date" },
							),
						}),
					});
				} catch (error) {
					throw new TRPCError({
						code: "INTERNAL_SERVER_ERROR",
						message:
							"Discover is temporarily unavailable. Please try again later.",
						cause: error,
					});
				}
			}

			const data = ctx.cache
				? await ctx.cache.getOrSet(
						keys.discover({ ...input, page }),
						TTL.SEARCH,
						fetchDiscover,
					)
				: await fetchDiscover();

			const safeResults = data.results.filter((r) => !r.adult);
			const movieIds = safeResults.map((r) => r.id);

			if (movieIds.length > 0) {
				try {
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
				} catch {
					// Best-effort cache; discover results are still valid from TMDB
				}
			}

			const { watchlistSet, watchedSet } = await getMovieStatuses(
				ctx,
				movieIds,
			);

			return {
				results: safeResults.map((r) => ({
					id: r.id,
					title: r.title,
					posterPath: r.poster_path ?? null,
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
	return db.query.movies
		.findFirst({
			where: eq(schema.movies.id, tmdbId),
			with: movieWithProvidersQuery,
		})
		.then((movie) => (movie ? normalizeMovieProviders(movie) : movie));
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
	ctx: { db: Database; tmdb: TMDB },
	tmdbId: number,
	country?: string,
) {
	try {
		const [details, videos, watchProviders] = await Promise.all([
			ctx.tmdb.movies.details({
				movie_id: tmdbId,
				append_to_response: ["keywords"],
			}),
			ctx.tmdb.movies.videos({ movie_id: tmdbId }),
			ctx.tmdb.movies.watch_providers({ movie_id: tmdbId }),
		]);

		const trailer = videos.results?.find(
			(v) => v.site === TRAILER_SITE && v.type === TRAILER_TYPE,
		);

		const isAdult =
			(details.adult ?? false) ||
			hasBlockedKeyword(details.keywords.keywords, details.vote_count ?? 0);

		const movieData = {
			adult: isAdult,
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
	} catch (error) {
		// Only fall back to stale data for TMDB API errors, not database errors
		const isTmdbError =
			error instanceof TMDBError ||
			error instanceof TypeError ||
			(error instanceof Error && error.message.startsWith("TMDB"));

		if (!isTmdbError) {
			throw error;
		}

		// oxlint-disable-next-line no-console
		console.error(`[TMDB] Failed to refresh movie ${tmdbId}:`, error);
		const staleMovie = await findMovieWithProviders(ctx.db, tmdbId);
		if (!staleMovie) {
			throw new TRPCError({
				code: "INTERNAL_SERVER_ERROR",
				message: "Movie data unavailable. Please try again later.",
			});
		}
		return staleMovie;
	}
}

async function upsertProviders(
	db: Database,
	movieId: number,
	providers: TMDBProvider[],
) {
	const normalizedProviders = mergeWatchProviders(
		providers.map((provider) => ({
			displayPriority: provider.display_priority,
			id: provider.provider_id,
			logoPath: provider.logo_path,
			name: provider.provider_name,
		})),
	);

	if (normalizedProviders.length === 0) {
		return;
	}

	await db
		.insert(schema.watchProviders)
		.values(
			normalizedProviders.map((provider) => ({
				displayPriority: provider.displayPriority,
				id: provider.id,
				logoPath: provider.logoPath,
				name: provider.name,
			})),
		)
		.onConflictDoNothing();

	await db
		.insert(schema.movieStreamProviders)
		.values(
			normalizedProviders.map((provider) => ({
				movieId,
				providerId: provider.id,
			})),
		)
		.onConflictDoNothing();
}

async function getFriendsWatchingMovies(db: Database, userId: string) {
	const ownWatchlist = db
		.select({ movieId: schema.watchlistEntries.movieId })
		.from(schema.watchlistEntries)
		.where(eq(schema.watchlistEntries.userId, userId));

	const ownWatched = db
		.select({ movieId: schema.watchedEntries.movieId })
		.from(schema.watchedEntries)
		.where(eq(schema.watchedEntries.userId, userId));

	const friendMovieCounts = db
		.select({
			movieId: schema.watchlistEntries.movieId,
			friendCount: count().as("friend_count"),
		})
		.from(schema.follows)
		.innerJoin(
			schema.watchlistEntries,
			eq(schema.watchlistEntries.userId, schema.follows.followingId),
		)
		.where(
			and(
				eq(schema.follows.followerId, userId),
				notInArray(schema.watchlistEntries.movieId, ownWatchlist),
				notInArray(schema.watchlistEntries.movieId, ownWatched),
			),
		)
		.groupBy(schema.watchlistEntries.movieId)
		.as("friend_movie_counts");

	const friendMovies = await db
		.select({
			id: schema.movies.id,
			title: schema.movies.title,
			posterPath: schema.movies.posterPath,
		})
		.from(friendMovieCounts)
		.innerJoin(schema.movies, eq(schema.movies.id, friendMovieCounts.movieId))
		.where(eq(schema.movies.adult, false))
		.orderBy(desc(friendMovieCounts.friendCount), desc(schema.movies.id))
		.limit(DISCOVER_SECTION_LIMIT);

	return friendMovies;
}
