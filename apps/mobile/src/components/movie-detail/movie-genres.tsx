import { View, Text, Pressable, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { fontSize, fontFamily, spacing, radius } from "@/lib/constants";
import { useThemedStyles, type ThemeColors } from "@/lib/theme";

interface MovieGenre {
	genre: { id: number; name: string };
}

interface MovieGenresProps {
	genres: MovieGenre[];
}

export function MovieGenres({ genres }: MovieGenresProps) {
	const styles = useThemedStyles(createStyles);
	const router = useRouter();

	if (genres.length === 0) {
		return null;
	}

	return (
		<View style={styles.genres}>
			{genres.map((g) => (
				<Pressable
					key={g.genre.id}
					style={({ pressed }) => [
						styles.genreBadge,
						pressed && styles.pressed,
					]}
					onPress={() =>
						router.push({
							pathname: "/genre/[id]",
							params: { id: String(g.genre.id), name: g.genre.name },
						})
					}
				>
					<Text style={styles.genreText}>{g.genre.name}</Text>
				</Pressable>
			))}
		</View>
	);
}

const createStyles = (colors: ThemeColors) =>
	StyleSheet.create({
		genres: {
			flexDirection: "row",
			flexWrap: "wrap",
			gap: spacing[2],
		},
		genreBadge: {
			backgroundColor: colors.secondary,
			paddingHorizontal: spacing[3],
			paddingVertical: spacing[1],
			borderRadius: radius.full,
			borderWidth: StyleSheet.hairlineWidth,
			borderColor: colors.border,
		},
		genreText: {
			fontSize: fontSize.xs,
			fontFamily: fontFamily.sansMedium,
			color: colors.foreground,
		},
		pressed: {
			opacity: 0.7,
		},
	});
