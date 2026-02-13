import type { Metadata } from "next";
import { trpc } from "@/lib/trpc/server";
import { MovieGrid } from "@/components/movie-grid";

export const metadata: Metadata = {
	title: "Popular",
};

export default async function PopularPage() {
	const api = await trpc();
	const movies = await api.movie.getPopular({ limit: 40, offset: 0 });

	return (
		<div className="space-y-8">
			<div>
				<h1 className="font-display text-2xl font-semibold tracking-tight">
					Popular
				</h1>
				<p className="mt-1 text-sm text-muted-foreground">
					Most watched on Miru
				</p>
			</div>

			<MovieGrid
				movies={movies.map((m) => ({
					id: m.id,
					posterPath: m.posterPath,
					title: m.title,
				}))}
				emptyMessage="No popular movies yet"
			/>
		</div>
	);
}
