import { describe, it, expect, vi, beforeEach } from "vitest";
import { TMDBClient } from "../tmdb";

const mockAccessToken = "test-access-token";

function firstFetchCall() {
	const {
		mock: { calls },
	} = vi.mocked(fetch);
	const [call] = calls;
	if (!call) {
		throw new Error("fetch was not called");
	}
	return call;
}

describe("TMDBClient", () => {
	let client: TMDBClient;

	beforeEach(() => {
		client = new TMDBClient(mockAccessToken);
		vi.restoreAllMocks();
	});

	describe("discoverMovies", () => {
		it("constructs correct URL with genres", async () => {
			const mockResponse = {
				page: 1,
				total_pages: 5,
				total_results: 100,
				results: [],
			};

			global.fetch = vi.fn().mockResolvedValue({
				ok: true,
				json: () => Promise.resolve(mockResponse),
			});

			await client.discoverMovies({
				genres: [28, 35],
				yearGte: undefined,
				yearLte: undefined,
				sortBy: "popularity.desc",
				page: 1,
			});

			const call = firstFetchCall();
			const url = new URL(call[0] as string);
			expect(url.searchParams.get("with_genres")).toBe("28,35");
			expect(url.searchParams.get("sort_by")).toBe("popularity.desc");
			expect(url.searchParams.get("include_adult")).toBe("false");
		});

		it("constructs correct URL with year range", async () => {
			const mockResponse = {
				page: 1,
				total_pages: 1,
				total_results: 10,
				results: [],
			};

			global.fetch = vi.fn().mockResolvedValue({
				ok: true,
				json: () => Promise.resolve(mockResponse),
			});

			await client.discoverMovies({
				genres: undefined,
				yearGte: 2020,
				yearLte: 2023,
				sortBy: undefined,
				page: 2,
			});

			const call = firstFetchCall();
			const url = new URL(call[0] as string);
			expect(url.searchParams.get("primary_release_date.gte")).toBe(
				"2020-01-01",
			);
			expect(url.searchParams.get("primary_release_date.lte")).toBe(
				"2023-12-31",
			);
			expect(url.searchParams.get("page")).toBe("2");
		});

		it("throws on non-ok response", async () => {
			global.fetch = vi.fn().mockResolvedValue({
				ok: false,
				status: 429,
				statusText: "Too Many Requests",
				text: () => Promise.resolve('{"status_message":"Rate limit exceeded"}'),
			});

			await expect(
				client.discoverMovies({
					genres: undefined,
					yearGte: undefined,
					yearLte: undefined,
					sortBy: undefined,
					page: 1,
				}),
			).rejects.toThrow("TMDB discover failed");
		});

		it("sends authorization header", async () => {
			global.fetch = vi.fn().mockResolvedValue({
				ok: true,
				json: () =>
					Promise.resolve({
						page: 1,
						total_pages: 1,
						total_results: 0,
						results: [],
					}),
			});

			await client.discoverMovies({
				genres: undefined,
				yearGte: undefined,
				yearLte: undefined,
				sortBy: undefined,
				page: 1,
			});

			const call = firstFetchCall();
			const headers = call[1]?.headers as Record<string, string>;
			expect(headers["Authorization"]).toBe(`Bearer ${mockAccessToken}`);
		});
	});

	describe("fetchPopular", () => {
		it("fetches popular movies", async () => {
			const mockResponse = {
				page: 1,
				total_pages: 500,
				total_results: 10000,
				results: [{ id: 1, title: "Test Movie" }],
			};

			global.fetch = vi.fn().mockResolvedValue({
				ok: true,
				json: () => Promise.resolve(mockResponse),
			});

			const result = await client.fetchPopular(1);

			expect(result.results).toHaveLength(1);
			const call = firstFetchCall();
			expect(call[0]).toContain("/movie/popular");
		});

		it("throws on failure", async () => {
			global.fetch = vi.fn().mockResolvedValue({
				ok: false,
				status: 500,
				statusText: "Internal Server Error",
				text: () => Promise.resolve(""),
			});

			await expect(client.fetchPopular()).rejects.toThrow(
				"TMDB popular failed",
			);
		});
	});

	describe("fetchNowPlaying", () => {
		it("fetches now playing movies", async () => {
			global.fetch = vi.fn().mockResolvedValue({
				ok: true,
				json: () =>
					Promise.resolve({
						page: 1,
						total_pages: 1,
						total_results: 5,
						results: [],
					}),
			});

			const result = await client.fetchNowPlaying(1);
			expect(result.page).toBe(1);

			const call = firstFetchCall();
			expect(call[0]).toContain("/movie/now_playing");
		});
	});
});
