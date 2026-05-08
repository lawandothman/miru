import { View, Text, Pressable, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { Colors, fontSize, fontFamily, spacing, radius } from "@/lib/constants";

interface MovieGenre {
	genre: { id: number; name: string };
}

interface MovieGenresProps {
	genres: MovieGenre[];
}

export function MovieGenres({ genres }: MovieGenresProps) {
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

const styles = StyleSheet.create({
	genres: {
		flexDirection: "row",
		flexWrap: "wrap",
		gap: spacing[2],
	},
	genreBadge: {
		backgroundColor: Colors.secondary,
		paddingHorizontal: spacing[3],
		paddingVertical: spacing[1],
		borderRadius: radius.full,
		borderWidth: StyleSheet.hairlineWidth,
		borderColor: Colors.border,
	},
	genreText: {
		fontSize: fontSize.xs,
		fontFamily: fontFamily.sansMedium,
		color: Colors.foreground,
	},
	pressed: {
		opacity: 0.7,
	},
});
