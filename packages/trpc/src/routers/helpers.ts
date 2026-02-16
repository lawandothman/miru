import { type Database, schema } from "@miru/db";
import { TRPCError } from "@trpc/server";
import { eq } from "drizzle-orm";
import type { TMDBClient } from "../tmdb";

export async function ensureMovieExists(
	db: Database,
	tmdb: TMDBClient,
	movieId: number,
) {
	const existing = await db.query.movies.findFirst({
		where: eq(schema.movies.id, movieId),
	});

	if (existing) {
		return;
	}

	try {
		const details = await tmdb.movies.details({ movie_id: movieId });
		await db
			.insert(schema.movies)
			.values({
				id: details.id,
				title: details.title,
				originalTitle: details.original_title ?? null,
				overview: details.overview ?? null,
				posterPath: details.poster_path ?? null,
				backdropPath: details.backdrop_path ?? null,
				releaseDate: details.release_date ?? null,
				adult: details.adult ?? false,
				popularity: details.popularity ?? null,
			})
			.onConflictDoNothing();
	} catch {
		throw new TRPCError({
			code: "NOT_FOUND",
			message: "Movie not found on TMDB",
		});
	}
}
