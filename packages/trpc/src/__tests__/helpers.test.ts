import { describe, it, expect } from "vitest";
import { buildGenreMap } from "../helpers";

describe("buildGenreMap", () => {
	it("builds a map from movie-genre rows", () => {
		const rows = [
			{ movieId: 1, genreId: 28 },
			{ movieId: 1, genreId: 35 },
			{ movieId: 2, genreId: 28 },
			{ movieId: 3, genreId: 18 },
		];

		const result = buildGenreMap(rows);

		expect(result.get(1)).toEqual([28, 35]);
		expect(result.get(2)).toEqual([28]);
		expect(result.get(3)).toEqual([18]);
	});

	it("returns an empty map for empty input", () => {
		const result = buildGenreMap([]);
		expect(result.size).toBe(0);
	});

	it("handles single genre per movie", () => {
		const rows = [
			{ movieId: 10, genreId: 99 },
			{ movieId: 20, genreId: 88 },
		];

		const result = buildGenreMap(rows);

		expect(result.get(10)).toEqual([99]);
		expect(result.get(20)).toEqual([88]);
		expect(result.size).toBe(2);
	});

	it("handles many genres for one movie", () => {
		const genres = [1, 2, 3, 4, 5, 6, 7, 8];
		const rows = genres.map((genreId) => ({ movieId: 42, genreId }));

		const result = buildGenreMap(rows);

		expect(result.get(42)).toEqual(genres);
		expect(result.size).toBe(1);
	});
});
