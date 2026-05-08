import { View, Text, Pressable, StyleSheet, Linking } from "react-native";
import { Image } from "expo-image";
import { Play } from "lucide-react-native";
import { ImdbLogo } from "@/components/imdb-logo";
import {
	Colors,
	posterUrl,
	fontSize,
	fontFamily,
	spacing,
	radius,
} from "@/lib/constants";

const POSTER_WIDTH = 110;
const POSTER_HEIGHT = 165;

interface MovieInfoRowProps {
	posterPath: string | null | undefined;
	title: string;
	year: string | null;
	hours: number | null;
	mins: number | null;
	rating: string | null;
	imdbId: string | null | undefined;
	trailerUrl: string | null;
	onTrailerPress: () => void;
}

export function MovieInfoRow({
	posterPath,
	title,
	year,
	hours,
	mins,
	rating,
	imdbId,
	trailerUrl,
	onTrailerPress,
}: MovieInfoRowProps) {
	return (
		<View style={styles.infoRow}>
			{posterPath && (
				<View style={styles.posterShadow}>
					<Image
						source={{ uri: posterUrl(posterPath) }}
						style={styles.poster}
						contentFit="cover"
					/>
				</View>
			)}

			<View style={styles.titleBlock}>
				<Text style={styles.title}>{title}</Text>
				<View style={styles.metaRow}>
					{year && <Text style={styles.metaText}>{year}</Text>}
					{hours !== null && (
						<>
							<Text style={styles.metaDot}>·</Text>
							<Text style={styles.metaText}>
								{hours}h {mins}m
							</Text>
						</>
					)}
					{rating && (
						<>
							<Text style={styles.metaDot}>·</Text>
							<Pressable
								style={({ pressed }) => [
									styles.inlineTap,
									pressed && styles.pressed,
								]}
								hitSlop={12}
								onPress={() => {
									if (imdbId) {
										Linking.openURL(`https://www.imdb.com/title/${imdbId}`);
									}
								}}
								disabled={!imdbId}
								accessibilityRole="link"
								accessibilityLabel={`IMDb rating ${rating}`}
							>
								<ImdbLogo />
								<Text style={styles.ratingText}>{rating}</Text>
							</Pressable>
						</>
					)}
					{trailerUrl && (
						<>
							<Text style={styles.metaDot}>·</Text>
							<Pressable
								style={({ pressed }) => [
									styles.inlineTap,
									pressed && styles.pressed,
								]}
								hitSlop={12}
								onPress={onTrailerPress}
								accessibilityRole="button"
								accessibilityLabel="Watch trailer"
							>
								<Play
									size={10}
									color={Colors.foreground}
									fill={Colors.foreground}
								/>
								<Text style={styles.trailerText}>Trailer</Text>
							</Pressable>
						</>
					)}
				</View>
			</View>
		</View>
	);
}

const styles = StyleSheet.create({
	infoRow: {
		flexDirection: "row",
		paddingHorizontal: spacing[4],
		gap: spacing[4],
		marginTop: -(POSTER_HEIGHT / 2),
		zIndex: 2,
	},
	titleBlock: {
		flex: 1,
		justifyContent: "flex-end",
		paddingBottom: spacing[2],
		gap: spacing[1],
	},
	title: {
		fontSize: fontSize["2xl"],
		fontFamily: fontFamily.displayBold,
		color: Colors.foreground,
		marginBottom: spacing[3],
	},
	metaRow: {
		flexDirection: "row",
		alignItems: "center",
		flexWrap: "wrap",
		gap: spacing[1],
		marginTop: spacing[1],
	},
	inlineTap: {
		flexDirection: "row",
		alignItems: "center",
		gap: 3,
	},
	trailerText: {
		fontSize: fontSize.xs,
		fontFamily: fontFamily.sansSemibold,
		color: Colors.foreground,
	},
	metaText: {
		fontSize: fontSize.xs,
		fontFamily: fontFamily.sansMedium,
		color: Colors.mutedForeground,
	},
	metaDot: {
		fontSize: fontSize.xs,
		color: Colors.mutedForeground,
		opacity: 0.5,
		marginHorizontal: 2,
	},
	ratingText: {
		fontSize: fontSize.xs,
		fontFamily: fontFamily.sansSemibold,
		color: Colors.gold,
	},
	posterShadow: {
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 8 },
		shadowOpacity: 0.5,
		shadowRadius: 16,
		elevation: 12,
	},
	poster: {
		width: POSTER_WIDTH,
		height: POSTER_HEIGHT,
		borderRadius: radius.lg,
		backgroundColor: Colors.secondary,
	},
	pressed: {
		opacity: 0.7,
	},
});
