import { notFound } from "next/navigation";
import { cache } from "react";
import type { Metadata } from "next";
import { trpc } from "@/lib/trpc/server";
import { GenreMovies } from "@/components/genre-movies";

interface GenrePageProps {
	params: Promise<{ id: string }>;
}

const getGenre = cache(async (id: number) => {
	const api = await trpc();
	return api.movie.getGenreById({ id });
});

export async function generateMetadata({
	params,
}: GenrePageProps): Promise<Metadata> {
	const { id } = await params;
	const genreId = parseInt(id, 10);
	if (isNaN(genreId)) {
		return { title: "Genre" };
	}
	try {
		const genre = await getGenre(genreId);
		return { title: genre.name };
	} catch {
		return { title: "Genre" };
	}
}

export default async function GenrePage({ params }: GenrePageProps) {
	const { id } = await params;
	const genreId = parseInt(id, 10);
	if (isNaN(genreId)) {
		notFound();
	}

	let genre;
	try {
		genre = await getGenre(genreId);
	} catch {
		notFound();
	}

	return (
		<div className="space-y-8">
			<div>
				<h1 className="font-display text-2xl font-semibold tracking-tight">
					{genre.name}
				</h1>
			</div>

			<GenreMovies genreId={genreId} />
		</div>
	);
}
