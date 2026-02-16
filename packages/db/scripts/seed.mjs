import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";
import postgres from "postgres";

const DEFAULT_REGION = process.env.TMDB_SEED_REGION ?? "US";
const DISCOVER_PAGES = parsePositiveInt(process.env.TMDB_SEED_PAGES, 2);
const PROVIDER_MOVIE_LIMIT = parsePositiveInt(
	process.env.TMDB_SEED_PROVIDER_MOVIE_LIMIT,
	30,
);

async function main() {
	const databaseUrl = process.env.DATABASE_URL;
	if (!databaseUrl) {
		throw new Error("Missing DATABASE_URL. Set it in packages/db/.env.");
	}

	const tmdbToken =
		process.env.TMDB_API_READ_ACCESS_TOKEN ??
		readEnvValue(
			resolve(process.cwd(), ".env"),
			"TMDB_API_READ_ACCESS_TOKEN",
		) ??
		readEnvValue(
			resolve(process.cwd(), "../../apps/web/.env"),
			"TMDB_API_READ_ACCESS_TOKEN",
		);

	if (!tmdbToken) {
		throw new Error(
			"Missing TMDB_API_READ_ACCESS_TOKEN. Set it in packages/db/.env or apps/web/.env.",
		);
	}

	const sql = postgres(databaseUrl, { max: 1 });

	try {
		writeOut(`Seeding minimal TMDB catalog for region ${DEFAULT_REGION}...\n`);

		const [genresResponse, providersResponse] = await Promise.all([
			tmdbRequest(
				"/genre/movie/list",
				{
					language: "en-US",
				},
				tmdbToken,
			),
			tmdbRequest(
				"/watch/providers/movie",
				{
					language: "en-US",
					watch_region: DEFAULT_REGION,
				},
				tmdbToken,
			),
		]);

		const genres = (genresResponse.genres ?? []).map((genre) => ({
			id: genre.id,
			name: genre.name,
		}));

		if (genres.length > 0) {
			await sql`
				insert into genres ${sql(genres, "id", "name")}
				on conflict (id) do update set name = excluded.name
			`;
		}

		const discoveredMovies = [];
		for (let page = 1; page <= DISCOVER_PAGES; page += 1) {
			const discoverResponse = await tmdbRequest(
				"/discover/movie",
				{
					include_adult: "false",
					include_video: "false",
					language: "en-US",
					page: String(page),
					sort_by: "popularity.desc",
					watch_region: DEFAULT_REGION,
					with_original_language: "en",
				},
				tmdbToken,
			);

			discoveredMovies.push(...(discoverResponse.results ?? []));
		}

		const uniqueMovieMap = new Map(
			discoveredMovies.map((movie) => [movie.id, movie]),
		);
		const uniqueMovies = [...uniqueMovieMap.values()];

		if (uniqueMovies.length === 0) {
			writeOut(
				"No movies returned by TMDB discover; seed completed with genres/providers only.\n",
			);
			return;
		}

		const providerMap = new Map(
			(providersResponse.results ?? []).map((provider) => [
				provider.provider_id,
				{
					display_priority: provider.display_priority ?? null,
					id: provider.provider_id,
					logo_path: provider.logo_path ?? null,
					name: provider.provider_name,
				},
			]),
		);

		const movieRows = uniqueMovies.map((movie) => ({
			adult: movie.adult ?? false,
			backdrop_path: movie.backdrop_path ?? null,
			id: movie.id,
			original_title: movie.original_title ?? null,
			overview: movie.overview ?? null,
			popularity: movie.popularity ?? null,
			poster_path: movie.poster_path ?? null,
			release_date: movie.release_date ?? null,
			title: movie.title,
			tmdb_vote_average: movie.vote_average ?? null,
			tmdb_vote_count: movie.vote_count ?? null,
			updated_at: new Date(),
		}));

		await sql`
			insert into movies ${sql(
				movieRows,
				"id",
				"title",
				"original_title",
				"overview",
				"poster_path",
				"backdrop_path",
				"release_date",
				"adult",
				"popularity",
				"tmdb_vote_average",
				"tmdb_vote_count",
				"updated_at",
			)}
			on conflict (id) do update set
				title = excluded.title,
				original_title = excluded.original_title,
				overview = excluded.overview,
				poster_path = excluded.poster_path,
				backdrop_path = excluded.backdrop_path,
				release_date = excluded.release_date,
				adult = excluded.adult,
				popularity = excluded.popularity,
				tmdb_vote_average = excluded.tmdb_vote_average,
				tmdb_vote_count = excluded.tmdb_vote_count,
				updated_at = excluded.updated_at
		`;

		const movieGenreRows = uniqueMovies
			.flatMap((movie) =>
				(movie.genre_ids ?? []).map((genreId) => ({
					genre_id: genreId,
					movie_id: movie.id,
				})),
			)
			.filter((entry) => genres.some((genre) => genre.id === entry.genre_id));

		if (movieGenreRows.length > 0) {
			await sql`
				insert into movie_genres ${sql(movieGenreRows, "movie_id", "genre_id")}
				on conflict do nothing
			`;
		}

		const providerSeedMovieIds = uniqueMovies
			.slice(0, PROVIDER_MOVIE_LIMIT)
			.map((movie) => movie.id);

		const streamRows = [];

		for (const movieId of providerSeedMovieIds) {
			const watchProvidersResponse = await tmdbRequest(
				`/movie/${movieId}/watch/providers`,
				{},
				tmdbToken,
			);

			const regional = watchProvidersResponse.results?.[DEFAULT_REGION];
			if (regional) {
				for (const provider of regional.flatrate ?? []) {
					providerMap.set(provider.provider_id, {
						display_priority: provider.display_priority ?? null,
						id: provider.provider_id,
						logo_path: provider.logo_path ?? null,
						name: provider.provider_name,
					});
					streamRows.push({
						movie_id: movieId,
						provider_id: provider.provider_id,
					});
				}
			}
		}

		const providers = [...providerMap.values()];
		if (providers.length > 0) {
			await sql`
				insert into watch_providers ${sql(
					providers,
					"id",
					"name",
					"logo_path",
					"display_priority",
				)}
				on conflict (id) do update set
					name = excluded.name,
					logo_path = excluded.logo_path,
					display_priority = excluded.display_priority
			`;
		}

		if (streamRows.length > 0) {
			await sql`
				insert into movie_stream_providers ${sql(streamRows, "movie_id", "provider_id")}
				on conflict do nothing
			`;
		}

		writeOut(
			`${[
				`Seed complete for ${DEFAULT_REGION}`,
				`genres=${genres.length}`,
				`movies=${uniqueMovies.length}`,
				`providers=${providers.length}`,
				`movieGenres=${movieGenreRows.length}`,
				`streamLinks=${streamRows.length}`,
			].join(" | ")}\n`,
		);
	} finally {
		await sql.end();
	}
}

function parsePositiveInt(value, fallbackValue) {
	const parsed = Number.parseInt(value ?? "", 10);
	if (Number.isNaN(parsed) || parsed <= 0) {
		return fallbackValue;
	}

	return parsed;
}

async function tmdbRequest(path, params, token) {
	const url = new URL(`https://api.themoviedb.org/3${path}`);
	for (const [key, value] of Object.entries(params)) {
		url.searchParams.set(key, String(value));
	}

	const response = await fetch(url, {
		headers: {
			accept: "application/json",
			authorization: `Bearer ${token}`,
		},
	});

	if (!response.ok) {
		const errorText = await response.text();
		throw new Error(
			`TMDB request failed (${response.status}) for ${path}: ${errorText}`,
		);
	}

	return response.json();
}

function readEnvValue(filePath, key) {
	if (!existsSync(filePath)) {
		return null;
	}

	const content = readFileSync(filePath, "utf8");
	for (const line of content.split(/\r?\n/u)) {
		if (line && !line.trimStart().startsWith("#")) {
			const separatorIndex = line.indexOf("=");
			if (separatorIndex > 0) {
				const envKey = line.slice(0, separatorIndex).trim();
				if (envKey === key) {
					const rawValue = line.slice(separatorIndex + 1).trim();
					return rawValue.replace(/^"|"$/gu, "");
				}
			}
		}
	}

	return null;
}

main().catch((error) => {
	writeErr(`${error instanceof Error ? error.message : String(error)}\n`);
	process.exitCode = 1;
});

function writeOut(message) {
	process.stdout.write(message);
}

function writeErr(message) {
	process.stderr.write(message);
}
