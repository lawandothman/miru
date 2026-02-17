import { MoviePoster } from "@/components/movie-poster";
import { Skeleton } from "@/components/ui/skeleton";

interface MovieCarouselProps {
	title: string;
	movies: { id: number; title: string; posterPath: string | null }[];
}

export function MovieCarousel({ title, movies }: MovieCarouselProps) {
	if (movies.length === 0) {
		return null;
	}

	return (
		<section className="space-y-3">
			<h2 className="text-sm font-medium uppercase tracking-wider text-muted-foreground">
				{title}
			</h2>
			<div className="scrollbar-hide flex gap-3 overflow-x-auto pb-1">
				{movies.map((movie) => (
					<MoviePoster
						key={movie.id}
						id={movie.id}
						title={movie.title}
						posterPath={movie.posterPath}
						className="w-32 shrink-0 sm:w-36"
					/>
				))}
			</div>
		</section>
	);
}

export function MovieCarouselSkeleton() {
	return (
		<div className="space-y-3">
			<Skeleton className="h-4 w-32" />
			<div className="flex gap-3">
				{Array.from({ length: 6 }, (_, i) => (
					<Skeleton
						key={i}
						className="aspect-[2/3] w-32 shrink-0 rounded-lg sm:w-36"
					/>
				))}
			</div>
		</div>
	);
}
