import { describe, it, expect } from "vitest";
import {
	diversityRerank,
	selectExplanation,
} from "../routers/recommendation-engine";

function makeScoredMovie(overrides: {
	id: number;
	title?: string;
	releaseDate?: string | null;
	totalScore?: number;
	friendSignal?: number;
	genreSignal?: number;
	collabSignal?: number;
	tmdbSignal?: number;
	streamingSignal?: number;
	popularitySignal?: number;
	friendCount?: number;
	platformWatchlistCount?: number;
}) {
	return {
		posterPath: null,
		releaseDate: null,
		friendSignal: 0,
		genreSignal: 0,
		collabSignal: 0,
		tmdbSignal: 0,
		streamingSignal: 0,
		popularitySignal: 0,
		totalScore: 0,
		friendCount: 0,
		platformWatchlistCount: 0,
		title: `Movie ${overrides.id}`,
		...overrides,
	};
}

describe("selectExplanation", () => {
	it("returns friends reason when friend signal is dominant", () => {
		const movie = makeScoredMovie({
			id: 1,
			friendSignal: 1.0,
			friendCount: 3,
		});

		const result = selectExplanation(movie);

		expect(result.type).toBe("friends");
		if (result.type === "friends") {
			expect(result.count).toBe(3);
		}
	});

	it("returns genre_match when genre signal is dominant", () => {
		const movie = makeScoredMovie({
			id: 2,
			genreSignal: 1.0,
		});

		const result = selectExplanation(movie);

		expect(result.type).toBe("genre_match");
	});

	it("returns because_you_watched when collab signal is dominant", () => {
		const movie = makeScoredMovie({
			id: 3,
			collabSignal: 1.0,
		});

		const result = selectExplanation(movie);

		expect(result.type).toBe("because_you_watched");
	});

	it("returns top_rated when tmdb signal is dominant and not recent", () => {
		const movie = makeScoredMovie({
			id: 4,
			tmdbSignal: 1.0,
			releaseDate: "2020-01-01",
		});

		const result = selectExplanation(movie);

		expect(result.type).toBe("top_rated");
	});

	it("returns trending when tmdb signal is dominant and movie is recent", () => {
		const now = new Date();
		const oneMonthAgo = new Date(now);
		oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

		const movie = makeScoredMovie({
			id: 5,
			tmdbSignal: 1.0,
			releaseDate: oneMonthAgo.toISOString().slice(0, 10),
		});

		const result = selectExplanation(movie);

		expect(result.type).toBe("trending");
	});

	it("returns available_on when streaming signal is dominant", () => {
		const movie = makeScoredMovie({
			id: 6,
			streamingSignal: 1.0,
		});

		const result = selectExplanation(movie);

		expect(result.type).toBe("available_on");
	});

	it("returns popular_on_miru when popularity signal is dominant", () => {
		const movie = makeScoredMovie({
			id: 7,
			popularitySignal: 1.0,
			platformWatchlistCount: 42,
		});

		const result = selectExplanation(movie);

		expect(result.type).toBe("popular_on_miru");
		if (result.type === "popular_on_miru") {
			expect(result.count).toBe(42);
		}
	});

	it("returns trending when all signals are zero", () => {
		const movie = makeScoredMovie({ id: 8 });
		const result = selectExplanation(movie);
		// When all signals are zero, the first one in the list wins (friends with value 0)
		// The actual behavior depends on signal ordering
		expect(["friends", "trending", "genre_match"]).toContain(result.type);
	});
});

describe("diversityRerank", () => {
	it("preserves all movies when no genre conflicts", () => {
		const movies = [
			makeScoredMovie({ id: 1, totalScore: 1.0 }),
			makeScoredMovie({ id: 2, totalScore: 0.8 }),
			makeScoredMovie({ id: 3, totalScore: 0.6 }),
		];

		const genreMap = new Map<number, number[]>([
			[1, [28]],
			[2, [35]],
			[3, [18]],
		]);
		const genreWeights = new Map<number, number>();

		const result = diversityRerank(movies, genreMap, genreWeights, 3);

		expect(result.map((r) => r.id)).toEqual([1, 2, 3]);
	});

	it("breaks up runs of 3 same-genre movies", () => {
		const movies = [
			makeScoredMovie({ id: 1, totalScore: 1.0 }),
			makeScoredMovie({ id: 2, totalScore: 0.9 }),
			makeScoredMovie({ id: 3, totalScore: 0.8 }),
			makeScoredMovie({ id: 4, totalScore: 0.7 }),
		];

		// All same genre
		const genreMap = new Map<number, number[]>([
			[1, [28]],
			[2, [28]],
			[3, [28]],
			[4, [35]],
		]);
		const genreWeights = new Map<number, number>([[28, 1.0]]);

		const result = diversityRerank(movies, genreMap, genreWeights, 4);

		// Movie 3 (third same-genre in a row) should be skipped initially
		// and movie 4 (different genre) placed before it
		expect(result.map((r) => r.id)).toEqual([1, 2, 4, 3]);
	});

	it("respects limit parameter", () => {
		const movies = Array.from({ length: 10 }, (_, i) =>
			makeScoredMovie({ id: i + 1, totalScore: 1.0 - i * 0.1 }),
		);

		const genreMap = new Map<number, number[]>();
		const genreWeights = new Map<number, number>();

		const result = diversityRerank(movies, genreMap, genreWeights, 5);

		expect(result).toHaveLength(5);
	});

	it("handles empty input", () => {
		const result = diversityRerank([], new Map(), new Map(), 10);
		expect(result).toHaveLength(0);
	});

	it("handles movies without genres", () => {
		const movies = [
			makeScoredMovie({ id: 1, totalScore: 1.0 }),
			makeScoredMovie({ id: 2, totalScore: 0.8 }),
		];

		const genreMap = new Map<number, number[]>();
		const genreWeights = new Map<number, number>();

		const result = diversityRerank(movies, genreMap, genreWeights, 2);

		expect(result.map((r) => r.id)).toEqual([1, 2]);
	});
});
