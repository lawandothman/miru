import { TMDB } from "@lorenzopant/tmdb";

const TMDB_BASE_URL = "https://api.themoviedb.org/3";

export interface DiscoverMoviesParams {
	genres: number[] | undefined;
	yearGte: number | undefined;
	yearLte: number | undefined;
	sortBy: string | undefined;
	page: number | undefined;
}

export interface TMDBDiscoverResult {
	id: number;
	title: string;
	original_title: string;
	overview: string;
	poster_path: string | null;
	backdrop_path: string | null;
	release_date: string;
	adult: boolean;
	genre_ids: number[];
	popularity: number;
	vote_average: number;
	vote_count: number;
}

export interface TMDBDiscoverResponse {
	page: number;
	total_pages: number;
	total_results: number;
	results: TMDBDiscoverResult[];
}

export class TMDBClient extends TMDB {
	private accessToken: string;

	constructor(accessToken: string) {
		super(accessToken);
		this.accessToken = accessToken;
	}

	async discoverMovies(
		params: DiscoverMoviesParams,
	): Promise<TMDBDiscoverResponse> {
		const searchParams = new URLSearchParams({
			include_adult: "false",
			language: "en-US",
			page: String(params.page ?? 1),
			sort_by: params.sortBy ?? "popularity.desc",
		});

		if (params.genres?.length) {
			searchParams.set("with_genres", params.genres.join(","));
		}
		if (params.yearGte) {
			searchParams.set("primary_release_date.gte", `${params.yearGte}-01-01`);
		}
		if (params.yearLte) {
			searchParams.set("primary_release_date.lte", `${params.yearLte}-12-31`);
		}

		const response = await fetch(
			`${TMDB_BASE_URL}/discover/movie?${searchParams.toString()}`,
			{
				headers: {
					Authorization: `Bearer ${this.accessToken}`,
					"Content-Type": "application/json",
				},
			},
		);

		if (!response.ok) {
			throw new Error(`TMDB discover failed: ${response.statusText}`);
		}

		return response.json() as Promise<TMDBDiscoverResponse>;
	}
}
