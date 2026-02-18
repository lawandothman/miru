import {
	View,
	Text,
	ScrollView,
	Pressable,
	StyleSheet,
	Dimensions,
} from "react-native";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter, Stack } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ChevronLeft, Star } from "lucide-react-native";
import { trpc } from "@/lib/trpc";
import { MovieActions } from "@/components/movie-actions";
import { UserAvatar } from "@/components/user-avatar";
import { LoadingScreen } from "@/components/loading-screen";
import {
	Colors,
	backdropUrl,
	posterUrl,
	providerLogoUrl,
	fontSize,
	fontFamily,
	spacing,
	radius,
} from "@/lib/constants";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const HERO_HEIGHT = SCREEN_WIDTH * 0.75;
const POSTER_WIDTH = 110;
const POSTER_HEIGHT = 165;

export default function MovieDetailScreen() {
	const { id } = useLocalSearchParams<{ id: string }>();
	const router = useRouter();
	const insets = useSafeAreaInsets();
	const tmdbId = Number(id);

	const { data: movie, isLoading } = trpc.movie.getById.useQuery(
		{ tmdbId },
		{ enabled: !Number.isNaN(tmdbId) },
	);

	if (isLoading || !movie) {
		return (
			<>
				<Stack.Screen options={{ headerShown: false }} />
				<LoadingScreen />
			</>
		);
	}

	const year = movie.releaseDate?.slice(0, 4);
	const hours = movie.runtime ? Math.floor(movie.runtime / 60) : null;
	const mins = movie.runtime ? movie.runtime % 60 : null;
	const rating = movie.tmdbVoteAverage
		? movie.tmdbVoteAverage.toFixed(1)
		: null;

	return (
		<>
			<Stack.Screen options={{ headerShown: false }} />
			<ScrollView
				style={styles.container}
				contentContainerStyle={styles.scroll}
				showsVerticalScrollIndicator={false}
			>
				{/* ── Hero: backdrop bleeds under status bar ─────────── */}
				<View style={styles.heroContainer}>
					{movie.backdropPath ? (
						<Image
							source={{ uri: backdropUrl(movie.backdropPath) }}
							style={styles.heroImage}
							contentFit="cover"
						/>
					) : (
						<View style={[styles.heroImage, styles.heroPlaceholder]} />
					)}

					{/* Gradient fade into background */}
					<LinearGradient
						colors={["transparent", "rgba(1,1,1,0.6)", Colors.background]}
						locations={[0, 0.55, 1]}
						style={styles.heroGradient}
					/>

					{/* Back button — respects safe area */}
					<Pressable
						style={[styles.backButton, { top: insets.top + spacing[2] }]}
						onPress={() => router.back()}
					>
						<ChevronLeft size={24} color="#fff" />
					</Pressable>
				</View>

				{/* ── Poster + Title row — overlaps hero bottom ──────── */}
				<View style={styles.infoRow}>
					{movie.posterPath && (
						<View style={styles.posterShadow}>
							<Image
								source={{ uri: posterUrl(movie.posterPath) }}
								style={styles.poster}
								contentFit="cover"
							/>
						</View>
					)}
					<View style={styles.titleBlock}>
						<Text style={styles.title} numberOfLines={3}>
							{movie.title}
						</Text>
						{movie.tagline ? (
							<Text style={styles.tagline} numberOfLines={2}>
								{movie.tagline}
							</Text>
						) : null}
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
									<Star
										size={13}
										color={Colors.gold}
										fill={Colors.gold}
										style={{ marginTop: 1 }}
									/>
									<Text style={styles.ratingText}>{rating}</Text>
								</>
							)}
						</View>
					</View>
				</View>

				{/* ── Body content ────────────────────────────────────── */}
				<View style={styles.body}>
					{/* Actions */}
					<MovieActions
						movieId={movie.id}
						inWatchlist={movie.inWatchlist}
						isWatched={movie.isWatched}
					/>

					{/* Genres */}
					{movie.genres && movie.genres.length > 0 && (
						<View style={styles.genres}>
							{movie.genres.map((g) => (
								<Pressable
									key={g.genre.id}
									style={({ pressed }) => [
										styles.genreBadge,
										pressed && styles.pressed,
									]}
									onPress={() => router.push(`/genre/${g.genre.id}`)}
								>
									<Text style={styles.genreText}>{g.genre.name}</Text>
								</Pressable>
							))}
						</View>
					)}

					{/* Overview */}
					{movie.overview && (
						<Text style={styles.overview}>{movie.overview}</Text>
					)}

					{/* Watch with friends */}
					{movie.matches.length > 0 && (
						<View style={styles.section}>
							<Text style={styles.sectionTitle}>Watch with</Text>
							<ScrollView
								horizontal
								showsHorizontalScrollIndicator={false}
								contentContainerStyle={styles.matchesScroll}
							>
								{movie.matches.map((match) => (
									<Pressable
										key={match.id}
										style={({ pressed }) => [
											styles.matchCard,
											pressed && styles.pressed,
										]}
										onPress={() => router.push(`/user/${match.id}`)}
									>
										<UserAvatar
											imageUrl={match.image}
											name={match.name}
											size={40}
										/>
										<Text style={styles.matchName} numberOfLines={1}>
											{match.name?.split(" ")[0]}
										</Text>
									</Pressable>
								))}
							</ScrollView>
						</View>
					)}

					{/* Streaming providers */}
					{movie.streamProviders && movie.streamProviders.length > 0 && (
						<View style={styles.section}>
							<Text style={styles.sectionTitle}>Available on</Text>
							<View style={styles.providers}>
								{movie.streamProviders.map((sp) => (
									<View key={sp.provider.id} style={styles.providerCard}>
										<Image
											source={{
												uri: providerLogoUrl(sp.provider.logoPath),
											}}
											style={styles.providerLogo}
											contentFit="cover"
										/>
										<Text style={styles.providerName} numberOfLines={1}>
											{sp.provider.name}
										</Text>
									</View>
								))}
							</View>
						</View>
					)}
				</View>
			</ScrollView>
		</>
	);
}

/* ── Styles ──────────────────────────────────────────────────────── */

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: Colors.background,
	},
	scroll: {
		paddingBottom: spacing[16],
	},

	/* Hero */
	heroContainer: {
		height: HERO_HEIGHT,
		position: "relative",
	},
	heroImage: {
		...StyleSheet.absoluteFillObject,
	},
	heroPlaceholder: {
		backgroundColor: Colors.secondary,
	},
	heroGradient: {
		...StyleSheet.absoluteFillObject,
	},
	backButton: {
		position: "absolute",
		left: spacing[4],
		width: 36,
		height: 36,
		borderRadius: 18,
		backgroundColor: "rgba(0,0,0,0.45)",
		justifyContent: "center",
		alignItems: "center",
	},

	/* Poster + Title row */
	infoRow: {
		flexDirection: "row",
		paddingHorizontal: spacing[4],
		gap: spacing[4],
		marginTop: -(POSTER_HEIGHT / 2),
		zIndex: 2,
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
	},
	tagline: {
		fontSize: fontSize.xs,
		fontFamily: fontFamily.sans,
		fontStyle: "italic",
		color: Colors.mutedForeground,
	},
	metaRow: {
		flexDirection: "row",
		alignItems: "center",
		flexWrap: "wrap",
		gap: spacing[1],
		marginTop: spacing[1],
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

	/* Body */
	body: {
		paddingHorizontal: spacing[4],
		paddingTop: spacing[5],
		gap: spacing[5],
	},

	/* Genres */
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

	/* Overview */
	overview: {
		fontSize: fontSize.sm,
		fontFamily: fontFamily.sans,
		color: Colors.mutedForeground,
		lineHeight: 22,
	},

	/* Sections */
	section: {
		gap: spacing[3],
	},
	sectionTitle: {
		fontSize: fontSize.base,
		fontFamily: fontFamily.displaySemibold,
		color: Colors.foreground,
	},

	/* Watch with */
	matchesScroll: {
		gap: spacing[3],
	},
	matchCard: {
		alignItems: "center",
		gap: spacing[1],
		width: 64,
	},
	matchName: {
		fontSize: fontSize.xs,
		fontFamily: fontFamily.sans,
		color: Colors.mutedForeground,
		textAlign: "center",
	},

	/* Providers */
	providers: {
		flexDirection: "row",
		flexWrap: "wrap",
		gap: spacing[3],
	},
	providerCard: {
		alignItems: "center",
		gap: spacing[1],
		width: 64,
	},
	providerLogo: {
		width: 48,
		height: 48,
		borderRadius: radius.lg,
		backgroundColor: Colors.secondary,
	},
	providerName: {
		fontSize: 10,
		fontFamily: fontFamily.sans,
		color: Colors.mutedForeground,
		textAlign: "center",
	},
});
