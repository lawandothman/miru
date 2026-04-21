import { ScrollView } from "react-native";
import { MoviePoster } from "./movie-poster";
import { spacing } from "@/lib/constants";
import type { MovieSummary } from "@/lib/types";

interface HorizontalMovieListProps {
	movies: MovieSummary[];
	posterWidth?: number;
	posterHeight?: number;
	gap?: number;
	contentPaddingHorizontal?: number;
}

export function HorizontalMovieList({
	movies,
	posterWidth = 120,
	posterHeight = 180,
	gap = spacing[3],
	contentPaddingHorizontal = spacing[4],
}: HorizontalMovieListProps) {
	return (
		<ScrollView
			horizontal
			showsHorizontalScrollIndicator={false}
			decelerationRate="fast"
			contentContainerStyle={{
				paddingHorizontal: contentPaddingHorizontal,
				gap,
			}}
		>
			{movies.map((movie) => (
				<MoviePoster
					key={movie.id}
					id={movie.id}
					posterPath={movie.posterPath}
					title={movie.title}
					width={posterWidth}
					height={posterHeight}
					transition={0}
				/>
			))}
		</ScrollView>
	);
}
