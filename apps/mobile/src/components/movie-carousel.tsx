import { View, Text, StyleSheet } from "react-native";
import { HorizontalMovieList } from "./horizontal-movie-list";
import { fontSize, fontFamily, spacing } from "@/lib/constants";
import { useThemedStyles, type ThemeColors } from "@/lib/theme";
import type { MovieSummary } from "@/lib/types";

interface MovieCarouselProps {
	title: string;
	movies: MovieSummary[];
}

export function MovieCarousel({ title, movies }: MovieCarouselProps) {
	const styles = useThemedStyles(createStyles);

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

const createStyles = (colors: ThemeColors) =>
	StyleSheet.create({
		container: {
			gap: spacing[3],
		},
		title: {
			fontSize: fontSize.lg,
			fontFamily: fontFamily.sansSemibold,
			color: colors.foreground,
			paddingHorizontal: spacing[4],
		},
	});
