import { useEffect } from "react";
import { ScrollView } from "react-native";
import { Image } from "expo-image";
import { MoviePoster } from "./movie-poster";
import { posterUrl, spacing } from "@/lib/constants";
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
	useEffect(() => {
		const uris = movies
			.map((m) => posterUrl(m.posterPath))
			.filter((u): u is string => Boolean(u));
		if (uris.length > 0) {
			Image.prefetch(uris, "memory-disk");
		}
	}, [movies]);

	return (
		<ScrollView
			horizontal
			showsHorizontalScrollIndicator={false}
			decelerationRate="fast"
			removeClippedSubviews
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
				/>
			))}
		</ScrollView>
	);
}
