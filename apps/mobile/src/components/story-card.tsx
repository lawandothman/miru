import { LinearGradient } from "expo-linear-gradient";
import type React from "react";
import { Image, StyleSheet, Text, View } from "react-native";
import {
	backdropUrl,
	Colors,
	fontFamily,
	fontSize,
	posterUrl,
	radius,
	spacing,
} from "@/lib/constants";

const CARD_WIDTH = 360;
const CARD_HEIGHT = 640;
const STORY_POSTER_W = 180;
const STORY_POSTER_H = 270;

interface StoryCardMovie {
	title: string;
	posterPath: string | null;
	backdropPath: string | null;
	releaseDate: string | null;
	runtime: number | null;
	tmdbVoteAverage: number | null;
	genres: { genre: { id: number; name: string } }[] | null;
}

export function StoryCard({
	movie,
	ref,
}: {
	movie: StoryCardMovie;
	ref?: React.Ref<View>;
}) {
	const year = movie.releaseDate?.slice(0, 4);
	const hours = movie.runtime ? Math.floor(movie.runtime / 60) : null;
	const mins = movie.runtime ? movie.runtime % 60 : null;
	const rating = movie.tmdbVoteAverage
		? movie.tmdbVoteAverage.toFixed(1)
		: null;

	return (
		<View ref={ref} style={styles.card} collapsable={false}>
			{/* Blurred backdrop */}
			{movie.backdropPath ? (
				<Image
					source={{ uri: backdropUrl(movie.backdropPath) }}
					style={[StyleSheet.absoluteFill, styles.backdrop]}
					blurRadius={25}
					resizeMode="cover"
				/>
			) : null}

			{/* Dark overlay */}
			<View style={styles.overlay} />

			{/* Gradient for depth */}
			<LinearGradient
				colors={["rgba(0,0,0,0.05)", "rgba(0,0,0,0.3)", "rgba(0,0,0,0.6)"]}
				locations={[0, 0.55, 1]}
				style={StyleSheet.absoluteFill}
			/>

			{/* Main content */}
			<View style={styles.content}>
				{/* Poster */}
				<View style={styles.posterShadow}>
					{movie.posterPath ? (
						<Image
							source={{ uri: posterUrl(movie.posterPath) }}
							style={styles.poster}
							resizeMode="cover"
						/>
					) : (
						<View style={[styles.poster, styles.posterPlaceholder]}>
							<Text style={styles.placeholderText}>{movie.title}</Text>
						</View>
					)}
				</View>

				{/* Title */}
				<Text style={styles.title} numberOfLines={2}>
					{movie.title}
				</Text>

				{/* Meta row */}
				<View style={styles.metaRow}>
					{year ? <Text style={styles.metaText}>{year}</Text> : null}
					{hours !== null ? (
						<>
							<Text style={styles.dot}>·</Text>
							<Text style={styles.metaText}>
								{hours}h {mins}m
							</Text>
						</>
					) : null}
					{rating ? (
						<>
							<Text style={styles.dot}>·</Text>
							<Text style={styles.ratingText}>★ {rating}</Text>
						</>
					) : null}
				</View>

				{/* Genres */}
				{movie.genres && movie.genres.length > 0 ? (
					<View style={styles.genres}>
						{movie.genres.slice(0, 3).map((g) => (
							<View key={g.genre.id} style={styles.genreBadge}>
								<Text style={styles.genreText}>{g.genre.name}</Text>
							</View>
						))}
					</View>
				) : null}
			</View>

			{/* Branding */}
			<View style={styles.branding}>
				<Text style={styles.brandName}>Miru</Text>
				<Text style={styles.brandUrl}>watchmiru.app</Text>
			</View>
		</View>
	);
}

const styles = StyleSheet.create({
	card: {
		width: CARD_WIDTH,
		height: CARD_HEIGHT,
		backgroundColor: "#000",
		overflow: "hidden",
	},
	backdrop: {
		width: CARD_WIDTH,
		height: CARD_HEIGHT,
	},
	overlay: {
		...StyleSheet.absoluteFill,
		backgroundColor: "rgba(0,0,0,0.4)",
	},

	/* Content */
	content: {
		flex: 1,
		alignItems: "center",
		justifyContent: "center",
		paddingHorizontal: spacing[6],
		gap: spacing[4],
		paddingBottom: spacing[8],
	},

	/* Poster */
	posterShadow: {
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 12 },
		shadowOpacity: 0.7,
		shadowRadius: 24,
		elevation: 20,
		marginBottom: spacing[2],
	},
	poster: {
		width: STORY_POSTER_W,
		height: STORY_POSTER_H,
		borderRadius: radius.xl,
		backgroundColor: Colors.secondary,
	},
	posterPlaceholder: {
		justifyContent: "center",
		alignItems: "center",
		paddingHorizontal: spacing[4],
	},
	placeholderText: {
		fontSize: fontSize.sm,
		fontFamily: fontFamily.displayBold,
		color: Colors.mutedForeground,
		textAlign: "center",
	},

	/* Title */
	title: {
		fontSize: 22,
		fontFamily: fontFamily.displayBold,
		color: "#fff",
		textAlign: "center",
		lineHeight: 28,
	},

	/* Meta */
	metaRow: {
		flexDirection: "row",
		alignItems: "center",
		gap: spacing[1],
	},
	metaText: {
		fontSize: fontSize.sm,
		fontFamily: fontFamily.sansMedium,
		color: "rgba(255,255,255,0.6)",
	},
	dot: {
		fontSize: fontSize.sm,
		color: "rgba(255,255,255,0.3)",
		marginHorizontal: 2,
	},
	ratingText: {
		fontSize: fontSize.sm,
		fontFamily: fontFamily.sansSemibold,
		color: Colors.gold,
	},

	/* Genres */
	genres: {
		flexDirection: "row",
		flexWrap: "wrap",
		justifyContent: "center",
		gap: spacing[2],
	},
	genreBadge: {
		backgroundColor: "rgba(255,255,255,0.08)",
		paddingHorizontal: spacing[3],
		paddingVertical: spacing[1],
		borderRadius: radius.full,
		borderWidth: StyleSheet.hairlineWidth,
		borderColor: "rgba(255,255,255,0.15)",
	},
	genreText: {
		fontSize: fontSize.xs,
		fontFamily: fontFamily.sansMedium,
		color: "rgba(255,255,255,0.7)",
	},

	/* Branding */
	branding: {
		alignItems: "center",
		paddingBottom: spacing[8],
		gap: spacing[1],
	},
	brandName: {
		fontSize: fontSize.lg,
		fontFamily: fontFamily.displayBold,
		color: "#fff",
		letterSpacing: 2,
	},
	brandUrl: {
		fontSize: fontSize.xs,
		fontFamily: fontFamily.sans,
		color: "rgba(255,255,255,0.4)",
	},
});
