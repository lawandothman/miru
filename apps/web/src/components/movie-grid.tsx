import { MoviePoster } from "./movie-poster";
import { Skeleton } from "@/components/ui/skeleton";

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
	return (
		<div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
			{Array.from({ length: count }).map((_, i) => (
				<Skeleton key={i} className="aspect-[2/3] rounded-lg" />
			))}
		</div>
	);
}
