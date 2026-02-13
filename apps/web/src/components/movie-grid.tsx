import { Skeleton } from "@/components/ui/skeleton";
import { MoviePoster } from "./movie-poster";

interface Movie {
	id: number;
	title: string;
	posterPath: string | null;
}

interface MovieGridProps {
	movies: Movie[];
	emptyMessage?: string;
}

export function MovieGrid({
	movies,
	emptyMessage = "No movies found",
}: MovieGridProps) {
	if (movies.length === 0) {
		return (
			<div className="flex flex-col items-center justify-center py-16 text-center">
				<p className="text-sm text-muted-foreground">{emptyMessage}</p>
			</div>
		);
	}

	return (
		<div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
			{movies.map((movie, i) => (
				<MoviePoster
					key={movie.id}
					id={movie.id}
					title={movie.title}
					posterPath={movie.posterPath}
					priority={i < 10}
				/>
			))}
		</div>
	);
}

export function MovieGridSkeleton({ count = 20 }: { count?: number }) {
	const ids = Array.from({ length: count }, (_, i) => `skeleton-${i}`);
	return (
		<div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
			{ids.map((id) => (
				<Skeleton key={id} className="aspect-[2/3] rounded-lg" />
			))}
		</div>
	);
}
