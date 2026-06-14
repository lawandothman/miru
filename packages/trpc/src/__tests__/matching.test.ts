import { describe, it, expect } from "vitest";
import {
	type DashboardMatch,
	filterUnwatchedMatches,
	parseDashboardMatches,
} from "../matching";

describe("parseDashboardMatches", () => {
	const sample: DashboardMatch[] = [
		{ id: 1, title: "Heat", posterPath: "/heat.jpg" },
		{ id: 2, title: "Dune", posterPath: null },
	];

	it("passes through an already-parsed array (postgres-js)", () => {
		expect(parseDashboardMatches(sample)).toBe(sample);
	});

	it("parses a JSON string (neon-http)", () => {
		expect(parseDashboardMatches(JSON.stringify(sample))).toEqual(sample);
	});

	it("handles an empty array", () => {
		expect(parseDashboardMatches([])).toEqual([]);
	});

	it("handles the empty JSON-array string", () => {
		expect(parseDashboardMatches("[]")).toEqual([]);
	});
});

describe("filterUnwatchedMatches", () => {
	const matches = [
		{ id: 1, title: "Heat", posterPath: "/heat.jpg" },
		{ id: 2, title: "Dune", posterPath: null },
		{ id: 3, title: "Sicario", posterPath: "/sicario.jpg" },
	];

	it("keeps movies neither person has watched and flags them in-watchlist", () => {
		const result = filterUnwatchedMatches(matches, [], []);
		expect(result.map((m) => m.id)).toEqual([1, 2, 3]);
		expect(result.every((m) => m.inWatchlist === true)).toBe(true);
	});

	it("drops movies the current user has already watched", () => {
		const result = filterUnwatchedMatches(matches, [1], []);
		expect(result.map((m) => m.id)).toEqual([2, 3]);
	});

	it("drops movies the friend has already watched", () => {
		const result = filterUnwatchedMatches(matches, [], [2]);
		expect(result.map((m) => m.id)).toEqual([1, 3]);
	});

	it("drops a movie either person has watched", () => {
		const result = filterUnwatchedMatches(matches, [1], [3]);
		expect(result.map((m) => m.id)).toEqual([2]);
	});

	it("returns nothing when both have watched everything", () => {
		const result = filterUnwatchedMatches(matches, [1, 2, 3], [2]);
		expect(result).toEqual([]);
	});

	it("preserves the movie fields it is given", () => {
		const movie = { id: 1, title: "Heat", posterPath: "/heat.jpg" };
		const result = filterUnwatchedMatches([movie], [], []);
		expect(result).toEqual([{ ...movie, inWatchlist: true }]);
	});

	it("handles an empty match list", () => {
		expect(filterUnwatchedMatches([], [1, 2], [3])).toEqual([]);
	});
});
