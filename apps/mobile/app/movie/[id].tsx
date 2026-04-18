import {
	View,
	Text,
	ScrollView,
	Pressable,
	StyleSheet,
	Dimensions,
	Linking,
} from "react-native";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter, Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
	ChevronLeft,
	Film,
	Play,
	RefreshCw,
	Share2,
} from "lucide-react-native";
import { ImdbLogo } from "@/components/imdb-logo";
import { useEffect, useRef, useState } from "react";
import { TRPCClientError } from "@trpc/client";
import {
	canShareToInstagramStories,
	ShareSheet,
	shareMovieLink,
} from "@/components/share-sheet";
import { trpc } from "@/lib/trpc";
import { capture } from "@/lib/analytics";
import { MovieActions } from "@/components/movie-actions";
import { UserAvatar } from "@/components/user-avatar";
import { MovieDetailSkeleton } from "@/components/movie-detail-skeleton";
import { EmptyState } from "@/components/empty-state";
import { useDefaultHeaderOptions } from "@/lib/navigation";
import {
	Colors,
	backdropUrl,
	getThemePalette,
	posterUrl,
	providerLogoUrl,
	fontSize,
	fontFamily,
	spacing,
	radius,
	useResolvedColorScheme,
} from "@/lib/constants";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const HERO_HEIGHT = SCREEN_WIDTH * 0.75;
const POSTER_WIDTH = 110;
const POSTER_HEIGHT = 165;
function isNotFoundError(error: unknown): boolean {
	return (
		error instanceof TRPCClientError &&
		(error.data?.httpStatus === 404 || error.data?.code === "NOT_FOUND")
	);
}

export default function MovieDetailScreen() {
	const { id } = useLocalSearchParams<{ id: string }>();
	const router = useRouter();
	const insets = useSafeAreaInsets();
	const headerOptions = useDefaultHeaderOptions();
	const resolvedScheme = useResolvedColorScheme();
	const palette = getThemePalette(resolvedScheme);
	const tmdbId = Number(id);

	const {
		data: movie,
		error,
		isLoading,
		refetch,
		isRefetching,
	} = trpc.movie.getById.useQuery(
		{ tmdbId },
		{ enabled: !Number.isNaN(tmdbId) },
	);

	const [shareVisible, setShareVisible] = useState(false);
	const [sharePending, setSharePending] = useState(false);

	const tracked = useRef(false);
	useEffect(() => {
		if (movie && !tracked.current) {
			tracked.current = true;
			capture("movie_viewed", { movie_id: tmdbId });
		}
	}, [movie, tmdbId]);

	const isInvalidId = Number.isNaN(tmdbId);
	const isMissingMovie =
		isInvalidId || isNotFoundError(error) || (!isLoading && !error && !movie);

	if (isLoading) {
		return (
			<>
				<StatusBar style="light" />
				<Stack.Screen options={{ headerShown: false }} />
				<MovieDetailSkeleton />
			</>
		);
	}

	if (isMissingMovie) {
		return (
			<>
				<Stack.Screen options={{ ...headerOptions, title: "Movie" }} />
				<View style={styles.emptyScreen}>
					<EmptyState
						icon={Film}
						title="Movie not found"
						description="This title may have moved, or the link is no longer available in Miru."
						actionLabel="Search movies"
						onAction={() => router.replace("/(tabs)/search")}
					/>
				</View>
			</>
		);
	}

	if (error || !movie) {
		return (
			<>
				<Stack.Screen options={{ ...headerOptions, title: "Movie" }} />
				<View style={styles.emptyScreen}>
					<EmptyState
						icon={RefreshCw}
						title="Couldn't load movie"
						description="We hit a problem loading this page. Try again, or head back and pick another title."
						actionLabel={isRefetching ? "Trying again..." : "Try again"}
						onAction={() => {
							void refetch();
						}}
					/>
				</View>
			</>
		);
	}

	const year = movie.releaseDate?.slice(0, 4);
	const hours = movie.runtime ? Math.floor(movie.runtime / 60) : null;
	const mins = movie.runtime ? movie.runtime % 60 : null;
	const rating = movie.tmdbVoteAverage
		? movie.tmdbVoteAverage.toFixed(1)
		: null;
	const trailerUrl =
		movie.trailerKey && movie.trailerSite === "YouTube"
			? `https://www.youtube.com/watch?v=${movie.trailerKey}`
			: null;
	const shareTarget = { id: movie.id, title: movie.title };

	async function handleSharePress() {
		if (sharePending) {
			return;
		}

		setSharePending(true);

		try {
			if (await canShareToInstagramStories()) {
				setShareVisible(true);
				return;
			}

			await shareMovieLink(shareTarget);
		} catch {
			// Ignore native share cancellations.
		} finally {
			setSharePending(false);
		}
	}

	return (
		<>
			<StatusBar style="light" />
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
						colors={[
							"transparent",
							resolvedScheme === "light"
								? "rgba(250, 250, 250, 0.6)"
								: "rgba(1, 1, 1, 0.6)",
							palette.background,
						]}
						locations={[0, 0.55, 1]}
						style={styles.heroGradient}
					/>

					{/* Navigation — respects safe area */}
					<View
						style={[styles.heroNav, { top: insets.top + spacing[2] }]}
						pointerEvents="box-none"
					>
						<Pressable
							style={({ pressed }) => [
								styles.heroButton,
								pressed && styles.heroButtonPressed,
							]}
							onPress={() => router.back()}
							accessibilityRole="button"
							accessibilityLabel="Go back"
						>
							<ChevronLeft size={20} color="#fff" />
						</Pressable>

						<Pressable
							style={({ pressed }) => [
								styles.heroButton,
								pressed && styles.heroButtonPressed,
							]}
							accessibilityRole="button"
							accessibilityLabel="Share movie"
							onPress={() => {
								void handleSharePress();
							}}
							disabled={sharePending}
						>
							<Share2 size={18} color="#fff" />
						</Pressable>
					</View>
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
						<Text style={styles.title}>{movie.title}</Text>
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
											if (movie.imdbId) {
												Linking.openURL(
													`https://www.imdb.com/title/${movie.imdbId}`,
												);
											}
										}}
										disabled={!movie.imdbId}
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
										onPress={() => {
											capture("trailer_viewed", { movie_id: tmdbId });
											Linking.openURL(trailerUrl);
										}}
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
					)}

					{/* Overview */}
					{(movie.tagline || movie.overview) && (
						<View style={styles.overviewBlock}>
							{movie.tagline ? (
								<Text style={styles.tagline}>{movie.tagline}</Text>
							) : null}
							{movie.overview ? (
								<Text style={styles.overview}>{movie.overview}</Text>
							) : null}
						</View>
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
								{movie.streamProviders.map((sp) => {
									const { url } = sp;
									return (
										<Pressable
											key={sp.provider.id}
											style={styles.providerCard}
											onPress={url ? () => Linking.openURL(url) : undefined}
										>
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
										</Pressable>
									);
								})}
							</View>
						</View>
					)}
				</View>
			</ScrollView>

			{shareVisible ? (
				<View style={StyleSheet.absoluteFill}>
					<ShareSheet
						movie={movie}
						visible={shareVisible}
						onClose={() => setShareVisible(false)}
					/>
				</View>
			) : null}
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
	emptyScreen: {
		flex: 1,
		paddingBottom: spacing[8],
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
	heroNav: {
		position: "absolute",
		left: spacing[4],
		right: spacing[4],
		flexDirection: "row",
		justifyContent: "space-between",
	},
	heroButton: {
		width: 44,
		height: 44,
		borderRadius: 22,
		backgroundColor: "rgba(0,0,0,0.45)",
		justifyContent: "center",
		alignItems: "center",
	},
	heroButtonPressed: {
		opacity: 0.7,
	},

	/* Poster + Title row */
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
	overviewBlock: {
		gap: spacing[2],
	},
	tagline: {
		fontSize: fontSize.xs,
		fontFamily: fontFamily.sansSemibold,
		color: Colors.mutedForeground,
		textTransform: "uppercase",
		letterSpacing: 1,
	},
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
