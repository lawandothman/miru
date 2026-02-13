import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { trpc } from "@/lib/trpc/server";
import { MovieGrid } from "@/components/movie-grid";

interface GenrePageProps {
	params: Promise<{ id: string }>;
}

export async function generateMetadata({
	params,
}: GenrePageProps): Promise<Metadata> {
	const { id } = await params;
	const api = await trpc();
	try {
		const genre = await api.movie.getGenreById({ id: parseInt(id, 10) });
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

	const api = await trpc();

	let genre;
	try {
		genre = await api.movie.getGenreById({ id: genreId });
	} catch {
		notFound();
	}

	const movies = await api.movie.getByGenre({ genreId, page: 1 });

	return (
		<div className="space-y-8">
			<div>
				<h1 className="font-display text-2xl font-semibold tracking-tight">
					{genre.name}
				</h1>
			</div>

			<MovieGrid
				movies={movies.map((m) => ({
					id: m.id,
					posterPath: m.posterPath,
					title: m.title,
				}))}
				emptyMessage="No movies in this genre"
			/>
		</div>
	);
}
