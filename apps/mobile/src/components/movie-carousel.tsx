import { View, Text, StyleSheet } from "react-native";
import { HorizontalMovieList } from "./horizontal-movie-list";
import { Colors, fontSize, fontFamily, spacing } from "@/lib/constants";
import type { MovieSummary } from "@/lib/types";

interface MovieCarouselProps {
	title: string;
	movies: MovieSummary[];
}

export function MovieCarousel({ title, movies }: MovieCarouselProps) {
	if (movies.length === 0) {
		return null;
	}

	return (
		<View style={styles.container}>
			<Text style={styles.title}>{title}</Text>
			<HorizontalMovieList movies={movies} />
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		gap: spacing[3],
	},
	title: {
		fontSize: fontSize.lg,
		fontFamily: fontFamily.sansSemibold,
		color: Colors.foreground,
		paddingHorizontal: spacing[4],
	},
});
