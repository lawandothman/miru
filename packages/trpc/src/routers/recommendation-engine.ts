import { type Database, schema } from "@miru/db";
import { and, count, eq, inArray, sql } from "drizzle-orm";
import { match } from "ts-pattern";
import { buildGenreMap } from "../helpers";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type RecommendationReason =
	| { type: "friends"; count: number }
	| { type: "trending" }
	| { type: "because_you_watched"; title: string }
	| { type: "popular_on_miru"; count: number }
	| { type: "available_on"; provider: string }
	| { type: "top_rated" }
	| { type: "genre_match" };

export interface RecommendedMovie {
	id: number;
	title: string;
	posterPath: string | null;
	releaseDate: string | null;
	friendCount: number;
	inWatchlist: boolean;
	isWatched: boolean;
	reason: RecommendationReason;
}

// ---------------------------------------------------------------------------
// Signal weights
// ---------------------------------------------------------------------------

const WEIGHTS = {
	friend: 0.3,
	genreMatch: 0.2,
	collaborative: 0.15,
	tmdbQuality: 0.15,
	streaming: 0.1,
	platformPopularity: 0.1,
} as const;

const FRIEND_DECAY_HALF_LIFE_DAYS = 30;
const COLLAB_MIN_MOVIES = 5;
const COLLAB_MIN_OVERLAP = 2;
const COLLAB_TOP_N = 50;

// ---------------------------------------------------------------------------
// Implicit Genre Preferences
// ---------------------------------------------------------------------------

export async function computeUserGenreWeights(
	db: Database,
	userId: string,
): Promise<Map<number, number>> {
	const [explicitPrefs, implicitCounts, watchedCounts] = await Promise.all([
		db
			.select({ genreId: schema.userGenrePreferences.genreId })
			.from(schema.userGenrePreferences)
			.where(eq(schema.userGenrePreferences.userId, userId)),
		db
			.select({
				genreId: schema.movieGenres.genreId,
				cnt: count(),
			})
			.from(schema.movieGenres)
			.innerJoin(
				schema.watchlistEntries,
				and(
					eq(schema.watchlistEntries.movieId, schema.movieGenres.movieId),
					eq(schema.watchlistEntries.userId, userId),
				),
			)
			.groupBy(schema.movieGenres.genreId),
		db
			.select({
				genreId: schema.movieGenres.genreId,
				cnt: count(),
			})
			.from(schema.movieGenres)
			.innerJoin(
				schema.watchedEntries,
				and(
					eq(schema.watchedEntries.movieId, schema.movieGenres.movieId),
					eq(schema.watchedEntries.userId, userId),
				),
			)
			.groupBy(schema.movieGenres.genreId),
	]);

	const explicitSet = new Set(explicitPrefs.map((p) => p.genreId));

	const genreCounts = new Map<number, number>();
	for (const row of [...implicitCounts, ...watchedCounts]) {
		genreCounts.set(row.genreId, (genreCounts.get(row.genreId) ?? 0) + row.cnt);
	}

	const maxCount = Math.max(...genreCounts.values(), 1);

	const allGenreIds = new Set([...genreCounts.keys(), ...explicitSet]);
	const weights = new Map<number, number>();

	for (const genreId of allGenreIds) {
		const implicitWeight = (genreCounts.get(genreId) ?? 0) / maxCount;
		const explicitWeight = explicitSet.has(genreId) ? 1.0 : 0.0;
		const blended = 0.7 * implicitWeight + 0.3 * explicitWeight;
		weights.set(genreId, blended);
	}

	return weights;
}

// ---------------------------------------------------------------------------
// Collaborative Filtering - find similar users
// ---------------------------------------------------------------------------

interface SimilarUser {
	userId: string;
	similarity: number;
}

export async function findSimilarUsers(
	db: Database,
	userId: string,
	userMovieIds: number[],
): Promise<SimilarUser[]> {
	if (userMovieIds.length === 0) {
		return [];
	}

	const [sharedCounts, watchedSharedCounts] = await Promise.all([
		db
			.select({
				otherUserId: schema.watchlistEntries.userId,
				overlapCount: count(),
			})
			.from(schema.watchlistEntries)
			.where(
				and(
					inArray(schema.watchlistEntries.movieId, userMovieIds),
					sql`${schema.watchlistEntries.userId} != ${userId}`,
				),
			)
			.groupBy(schema.watchlistEntries.userId),
		db
			.select({
				otherUserId: schema.watchedEntries.userId,
				overlapCount: count(),
			})
			.from(schema.watchedEntries)
			.where(
				and(
					inArray(schema.watchedEntries.movieId, userMovieIds),
					sql`${schema.watchedEntries.userId} != ${userId}`,
				),
			)
			.groupBy(schema.watchedEntries.userId),
	]);

	const overlapMap = new Map<string, number>();
	for (const row of [...sharedCounts, ...watchedSharedCounts]) {
		overlapMap.set(
			row.otherUserId,
			(overlapMap.get(row.otherUserId) ?? 0) + row.overlapCount,
		);
	}

	const candidateUserIds = [...overlapMap.entries()]
		.filter(([, overlap]) => overlap >= COLLAB_MIN_OVERLAP)
		.map(([uid]) => uid);

	if (candidateUserIds.length === 0) {
		return [];
	}

	const [userMovieCounts, watchedMovieCounts] = await Promise.all([
		db
			.select({
				userId: schema.watchlistEntries.userId,
				cnt: count(),
			})
			.from(schema.watchlistEntries)
			.where(inArray(schema.watchlistEntries.userId, candidateUserIds))
			.groupBy(schema.watchlistEntries.userId),
		db
			.select({
				userId: schema.watchedEntries.userId,
				cnt: count(),
			})
			.from(schema.watchedEntries)
			.where(inArray(schema.watchedEntries.userId, candidateUserIds))
			.groupBy(schema.watchedEntries.userId),
	]);

	const totalCountMap = new Map<string, number>();
	for (const row of [...userMovieCounts, ...watchedMovieCounts]) {
		totalCountMap.set(
			row.userId,
			(totalCountMap.get(row.userId) ?? 0) + row.cnt,
		);
	}

	const userSetSize = userMovieIds.length;
	const results: SimilarUser[] = [];

	for (const [otherUserId, overlap] of overlapMap.entries()) {
		const otherTotal = totalCountMap.get(otherUserId) ?? 0;
		if (otherTotal >= COLLAB_MIN_MOVIES) {
			const union = userSetSize + otherTotal - overlap;
			const similarity = union > 0 ? overlap / union : 0;
			if (similarity > 0) {
				results.push({ userId: otherUserId, similarity });
			}
		}
	}

	results.sort((a, b) => b.similarity - a.similarity);
	return results.slice(0, COLLAB_TOP_N);
}

// ---------------------------------------------------------------------------
// Main Recommendation Query
// ---------------------------------------------------------------------------

interface ScoredMovie {
	id: number;
	title: string;
	posterPath: string | null;
	releaseDate: string | null;
	friendSignal: number;
	genreSignal: number;
	collabSignal: number;
	tmdbSignal: number;
	streamingSignal: number;
	popularitySignal: number;
	totalScore: number;
	friendCount: number;
	platformWatchlistCount: number;
}

export async function getRecommendedMovies(
	db: Database,
	userId: string,
	genreWeights: Map<number, number>,
	similarUsers: SimilarUser[],
	excludeIds: number[],
	userStreamingProviderIds: number[],
): Promise<ScoredMovie[]> {
	const preferredGenreIds = [...genreWeights.keys()];

	// Batch 1: All candidate source queries run in parallel
	const [
		friendMovies,
		collabCandidates,
		genreMovies,
		platformPopular,
		trendingMovies,
	] = await Promise.all([
		// Source A: Friend watchlist movies
		db
			.select({
				movieId: schema.watchlistEntries.movieId,
				friendCount: count(),
			})
			.from(schema.follows)
			.innerJoin(
				schema.watchlistEntries,
				eq(schema.watchlistEntries.userId, schema.follows.followingId),
			)
			.where(eq(schema.follows.followerId, userId))
			.groupBy(schema.watchlistEntries.movieId),

		// Source B: Collaborative filtering candidates
		similarUsers.length > 0
			? db
					.select({
						movieId: schema.watchlistEntries.movieId,
						userId: schema.watchlistEntries.userId,
					})
					.from(schema.watchlistEntries)
					.where(
						inArray(
							schema.watchlistEntries.userId,
							similarUsers.map((u) => u.userId),
						),
					)
			: Promise.resolve([] as { movieId: number; userId: string }[]),

		// Source C: Genre-matching movies
		preferredGenreIds.length > 0
			? db
					.select({ movieId: schema.movieGenres.movieId })
					.from(schema.movieGenres)
					.innerJoin(
						schema.movies,
						eq(schema.movies.id, schema.movieGenres.movieId),
					)
					.where(
						and(
							inArray(schema.movieGenres.genreId, preferredGenreIds),
							eq(schema.movies.adult, false),
						),
					)
					.groupBy(schema.movieGenres.movieId)
					.orderBy(sql`MAX(${schema.movies.popularity}) DESC NULLS LAST`)
					.limit(200)
			: Promise.resolve([] as { movieId: number }[]),

		// Source D: Platform popular movies
		db
			.select({
				movieId: schema.watchlistEntries.movieId,
				cnt: count(),
			})
			.from(schema.watchlistEntries)
			.groupBy(schema.watchlistEntries.movieId)
			.orderBy(sql`count(*) DESC`)
			.limit(100),

		// Source E: Trending / high quality
		db
			.select({ id: schema.movies.id })
			.from(schema.movies)
			.where(eq(schema.movies.adult, false))
			.orderBy(sql`${schema.movies.popularity} DESC NULLS LAST`)
			.limit(200),
	]);

	// Build candidate set + signal maps from batch 1 results
	const candidateMovieIds = new Set<number>();

	const friendCountMap = new Map<number, number>();
	for (const row of friendMovies) {
		friendCountMap.set(row.movieId, row.friendCount);
		candidateMovieIds.add(row.movieId);
	}

	const collabScoreMap = new Map<number, number>();
	if (similarUsers.length > 0) {
		const simMap = new Map(similarUsers.map((u) => [u.userId, u.similarity]));
		for (const row of collabCandidates) {
			const sim = simMap.get(row.userId) ?? 0;
			collabScoreMap.set(
				row.movieId,
				(collabScoreMap.get(row.movieId) ?? 0) + sim,
			);
			candidateMovieIds.add(row.movieId);
		}
	}

	for (const row of genreMovies) {
		candidateMovieIds.add(row.movieId);
	}

	const platformCountMap = new Map<number, number>();
	for (const row of platformPopular) {
		platformCountMap.set(row.movieId, row.cnt);
		candidateMovieIds.add(row.movieId);
	}

	for (const row of trendingMovies) {
		candidateMovieIds.add(row.id);
	}

	// Remove excluded movies
	for (const id of excludeIds) {
		candidateMovieIds.delete(id);
	}

	if (candidateMovieIds.size === 0) {
		return [];
	}

	const candidateIds = [...candidateMovieIds];

	// Batch 2: All candidate enrichment queries run in parallel
	const [movieRows, movieGenreRows, streamRows, friendWatchlistTimes] =
		await Promise.all([
			// Movie data
			db
				.select({
					id: schema.movies.id,
					title: schema.movies.title,
					posterPath: schema.movies.posterPath,
					releaseDate: schema.movies.releaseDate,
					tmdbVoteAverage: schema.movies.tmdbVoteAverage,
					tmdbVoteCount: schema.movies.tmdbVoteCount,
					popularity: schema.movies.popularity,
				})
				.from(schema.movies)
				.where(
					and(
						inArray(schema.movies.id, candidateIds),
						eq(schema.movies.adult, false),
					),
				),

			// Genres for candidates
			db
				.select({
					movieId: schema.movieGenres.movieId,
					genreId: schema.movieGenres.genreId,
				})
				.from(schema.movieGenres)
				.where(inArray(schema.movieGenres.movieId, candidateIds)),

			// Streaming availability
			userStreamingProviderIds.length > 0
				? db
						.select({ movieId: schema.movieStreamProviders.movieId })
						.from(schema.movieStreamProviders)
						.where(
							and(
								inArray(schema.movieStreamProviders.movieId, candidateIds),
								inArray(
									schema.movieStreamProviders.providerId,
									userStreamingProviderIds,
								),
							),
						)
				: Promise.resolve([] as { movieId: number }[]),

			// Friend watchlist timestamps for time-decay
			db
				.select({
					movieId: schema.watchlistEntries.movieId,
					createdAt: schema.watchlistEntries.createdAt,
				})
				.from(schema.follows)
				.innerJoin(
					schema.watchlistEntries,
					eq(schema.watchlistEntries.userId, schema.follows.followingId),
				)
				.where(
					and(
						eq(schema.follows.followerId, userId),
						inArray(schema.watchlistEntries.movieId, candidateIds),
					),
				),
		]);

	const movieGenreMap = buildGenreMap(movieGenreRows);

	const streamingSet = new Set(streamRows.map((r) => r.movieId));

	const now = Date.now();
	const decayedFriendCount = new Map<number, number>();
	for (const row of friendWatchlistTimes) {
		const daysSince = (now - row.createdAt.getTime()) / (1000 * 60 * 60 * 24);
		const decay = 0.5 ** (daysSince / FRIEND_DECAY_HALF_LIFE_DAYS);
		decayedFriendCount.set(
			row.movieId,
			(decayedFriendCount.get(row.movieId) ?? 0) + decay,
		);
	}

	// Score each candidate
	const scored: ScoredMovie[] = [];

	for (const movie of movieRows) {
		const decayedCount = decayedFriendCount.get(movie.id) ?? 0;
		const friendSignal = Math.min(decayedCount / 3.0, 1.0);

		const movieGenres = movieGenreMap.get(movie.id) ?? [];
		let genreSignal = 0;
		if (movieGenres.length > 0 && genreWeights.size > 0) {
			const genreScores = movieGenres.map((gid) => genreWeights.get(gid) ?? 0);
			genreSignal = genreScores.reduce((a, b) => a + b, 0) / genreScores.length;
		}

		const collabRaw = collabScoreMap.get(movie.id) ?? 0;
		const collabSignal = Math.min(collabRaw / 1.5, 1.0);

		const voteCount = movie.tmdbVoteCount ?? 0;
		const voteAvg = movie.tmdbVoteAverage ?? 0;
		// Use vote average when available (50+ votes), fall back to normalized popularity
		const quality =
			voteCount >= 50
				? voteAvg / 10.0
				: Math.min((movie.popularity ?? 0) / 100, 1.0);

		let freshness = 0;
		if (movie.releaseDate) {
			const releaseTime = new Date(movie.releaseDate).getTime();
			const monthsAgo = (now - releaseTime) / (1000 * 60 * 60 * 24 * 30);
			if (monthsAgo < 0) {
				freshness = 1.0;
			} else if (monthsAgo < 3) {
				freshness = 0.8;
			} else if (monthsAgo < 12) {
				freshness = 0.5;
			} else {
				freshness = 0.0;
			}
		}
		const tmdbSignal = 0.6 * quality + 0.4 * freshness;

		const streamingSignal = streamingSet.has(movie.id) ? 1.0 : 0.0;

		const platCount = platformCountMap.get(movie.id) ?? 0;
		const popularitySignal = Math.min(platCount / 10.0, 1.0);

		const totalScore =
			WEIGHTS.friend * friendSignal +
			WEIGHTS.genreMatch * genreSignal +
			WEIGHTS.collaborative * collabSignal +
			WEIGHTS.tmdbQuality * tmdbSignal +
			WEIGHTS.streaming * streamingSignal +
			WEIGHTS.platformPopularity * popularitySignal;

		scored.push({
			id: movie.id,
			title: movie.title,
			posterPath: movie.posterPath,
			releaseDate: movie.releaseDate,
			friendSignal,
			genreSignal,
			collabSignal,
			tmdbSignal,
			streamingSignal,
			popularitySignal,
			totalScore,
			friendCount: friendCountMap.get(movie.id) ?? 0,
			platformWatchlistCount: platCount,
		});
	}

	scored.sort((a, b) => b.totalScore - a.totalScore);

	return scored;
}

// ---------------------------------------------------------------------------
// Diversity Re-ranking
// ---------------------------------------------------------------------------

export function diversityRerank(
	movies: ScoredMovie[],
	movieGenreMap: Map<number, number[]>,
	genreWeights: Map<number, number>,
	limit: number,
): ScoredMovie[] {
	const result: ScoredMovie[] = [];
	const recentGenres: number[] = [];
	const used = new Set<number>();

	const primaryGenreFor = (movieId: number): number | null => {
		const genres = movieGenreMap.get(movieId);
		if (!genres || genres.length === 0) {
			return null;
		}
		return genres.reduce((best, gid) =>
			(genreWeights.get(gid) ?? 0) > (genreWeights.get(best) ?? 0) ? gid : best,
		);
	};

	// First pass: pick highest-scored movies while maintaining genre diversity
	for (const movie of movies) {
		if (result.length >= limit) {
			break;
		}
		if (!used.has(movie.id)) {
			const pg = primaryGenreFor(movie.id);
			const last2 = recentGenres.slice(-2);
			const isRepeatGenre =
				pg !== null &&
				last2.length === 2 &&
				last2[0] === pg &&
				last2[1] === pg;

			if (!isRepeatGenre) {
				result.push(movie);
				used.add(movie.id);
				if (pg !== null) {
					recentGenres.push(pg);
				}
			}
		}
	}

	// Second pass: fill remaining slots from skipped movies
	if (result.length < limit) {
		for (const movie of movies) {
			if (result.length >= limit) {
				break;
			}
			if (!used.has(movie.id)) {
				result.push(movie);
				used.add(movie.id);
			}
		}
	}

	return result;
}

// ---------------------------------------------------------------------------
// Explanation Selection
// ---------------------------------------------------------------------------

export function selectExplanation(movie: ScoredMovie): RecommendationReason {
	const signals: { type: RecommendationReason["type"]; value: number }[] = [
		{ type: "friends", value: movie.friendSignal * WEIGHTS.friend },
		{ type: "genre_match", value: movie.genreSignal * WEIGHTS.genreMatch },
		{
			type: "because_you_watched",
			value: movie.collabSignal * WEIGHTS.collaborative,
		},
		{ type: "top_rated", value: movie.tmdbSignal * WEIGHTS.tmdbQuality },
		{
			type: "available_on",
			value: movie.streamingSignal * WEIGHTS.streaming,
		},
		{
			type: "popular_on_miru",
			value: movie.popularitySignal * WEIGHTS.platformPopularity,
		},
	];

	signals.sort((a, b) => b.value - a.value);
	const [dominant] = signals;

	if (!dominant) {
		return { type: "trending" };
	}

	return match(dominant.type)
		.with("friends", () => ({
			type: "friends" as const,
			count: movie.friendCount,
		}))
		.with("popular_on_miru", () => ({
			type: "popular_on_miru" as const,
			count: movie.platformWatchlistCount,
		}))
		.with("because_you_watched", () => ({
			type: "because_you_watched" as const,
			title: "",
		}))
		.with("available_on", () => ({
			type: "available_on" as const,
			provider: "",
		}))
		.with("top_rated", () => {
			if (movie.releaseDate) {
				const monthsAgo =
					(Date.now() - new Date(movie.releaseDate).getTime()) /
					(1000 * 60 * 60 * 24 * 30);
				if (monthsAgo < 3) {
					return { type: "trending" as const };
				}
			}
			return { type: "top_rated" as const };
		})
		.with("genre_match", () => ({ type: "genre_match" as const }))
		.with("trending", () => ({ type: "trending" as const }))
		.exhaustive();
}

// ---------------------------------------------------------------------------
// Explanation Enrichment (post-query)
// ---------------------------------------------------------------------------

export async function enrichExplanations(
	db: Database,
	userId: string,
	movies: { id: number; reason: RecommendationReason }[],
): Promise<void> {
	const collabMovies = movies.filter(
		(m) => m.reason.type === "because_you_watched",
	);
	const streamingMovies = movies.filter(
		(m) => m.reason.type === "available_on",
	);

	// Run both enrichment paths in parallel
	const [recentTitle, providerMap] = await Promise.all([
		// Enrich "because_you_watched" — find a recent user movie title
		collabMovies.length > 0
			? db
					.select({ title: schema.movies.title })
					.from(schema.watchedEntries)
					.innerJoin(
						schema.movies,
						eq(schema.movies.id, schema.watchedEntries.movieId),
					)
					.where(eq(schema.watchedEntries.userId, userId))
					.orderBy(sql`${schema.watchedEntries.createdAt} DESC`)
					.limit(1)
					.then((rows) => rows[0]?.title ?? null)
			: Promise.resolve(null),

		// Enrich "available_on" — fetch provider names for these movies
		streamingMovies.length > 0
			? db
					.select({
						movieId: schema.movieStreamProviders.movieId,
						providerName: schema.watchProviders.name,
					})
					.from(schema.movieStreamProviders)
					.innerJoin(
						schema.watchProviders,
						eq(
							schema.watchProviders.id,
							schema.movieStreamProviders.providerId,
						),
					)
					.where(
						inArray(
							schema.movieStreamProviders.movieId,
							streamingMovies.map((m) => m.id),
						),
					)
					.then((rows) => {
						const result = new Map<number, string>();
						for (const row of rows) {
							if (!result.has(row.movieId)) {
								result.set(row.movieId, row.providerName);
							}
						}
						return result;
					})
			: Promise.resolve(new Map<number, string>()),
	]);

	for (const m of collabMovies) {
		if (m.reason.type === "because_you_watched") {
			m.reason.title = recentTitle ?? "your watchlist";
		}
	}

	for (const m of streamingMovies) {
		if (m.reason.type === "available_on") {
			m.reason.provider = providerMap.get(m.id) ?? "your services";
		}
	}
}
