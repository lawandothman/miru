import { NextResponse } from "next/server";
import { schema, sql } from "@miru/db";
import { db, tmdb } from "@/lib/server";
import { env } from "@/env";

const PAGES_TO_FETCH = 3;

export async function GET(request: Request) {
	const authHeader = request.headers.get("authorization");

	if (env.CRON_SECRET && authHeader !== `Bearer ${env.CRON_SECRET}`) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	try {
		let seeded = 0;

		// Fetch popular and now-playing movies (3 pages each)
		const fetches = await Promise.all([
			...Array.from({ length: PAGES_TO_FETCH }, (_, i) =>
				tmdb.fetchPopular(i + 1),
			),
			...Array.from({ length: PAGES_TO_FETCH }, (_, i) =>
				tmdb.fetchNowPlaying(i + 1),
			),
		]);

		// Deduplicate by ID
		const movieMap = new Map<number, (typeof fetches)[0]["results"][number]>();
		for (const page of fetches) {
			for (const movie of page.results) {
				if (!movie.adult) {
					movieMap.set(movie.id, movie);
				}
			}
		}

		const movies = [...movieMap.values()];

		if (movies.length > 0) {
			// Upsert movies — update popularity scores on conflict
			await db
				.insert(schema.movies)
				.values(
					movies.map((m) => ({
						id: m.id,
						title: m.title,
						originalTitle: m.original_title ?? null,
						overview: m.overview ?? null,
						posterPath: m.poster_path ?? null,
						backdropPath: m.backdrop_path ?? null,
						releaseDate: m.release_date ?? null,
						adult: false,
						popularity: m.popularity ?? null,
						tmdbVoteAverage: m.vote_average ?? null,
						tmdbVoteCount: m.vote_count ?? null,
						updatedAt: new Date(),
					})),
				)
				.onConflictDoUpdate({
					target: schema.movies.id,
					set: {
						popularity: sql`excluded.popularity`,
						tmdbVoteAverage: sql`excluded.tmdb_vote_average`,
						tmdbVoteCount: sql`excluded.tmdb_vote_count`,
						updatedAt: new Date(),
					},
				});

			// Seed movie_genres for these movies
			const genreValues: { movieId: number; genreId: number }[] = [];
			for (const movie of movies) {
				for (const genreId of movie.genre_ids) {
					genreValues.push({ movieId: movie.id, genreId });
				}
			}

			if (genreValues.length > 0) {
				await db
					.insert(schema.movieGenres)
					.values(genreValues)
					.onConflictDoNothing();
			}

			seeded = movies.length;
		}

		return NextResponse.json({ ok: true, seeded });
	} catch {
		return NextResponse.json(
			{ error: "Seed trending failed" },
			{ status: 500 },
		);
	}
}
