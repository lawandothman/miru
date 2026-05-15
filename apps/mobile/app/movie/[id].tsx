import { View, ScrollView, StyleSheet, Linking } from "react-native";
import { useLocalSearchParams, useRouter, Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Film, RefreshCw } from "lucide-react-native";
import { useEffect, useRef, useState } from "react";
import { TRPCClientError } from "@trpc/client";
import { ShareSheet } from "@/components/share-sheet";
import { MovieActions } from "@/components/movie-actions";
import { MovieDetailSkeleton } from "@/components/movie-detail-skeleton";
import { EmptyState } from "@/components/empty-state";
import { MovieHero } from "@/components/movie-detail/movie-hero";
import { MovieInfoRow } from "@/components/movie-detail/movie-info-row";
import { MovieGenres } from "@/components/movie-detail/movie-genres";
import { MovieOverview } from "@/components/movie-detail/movie-overview";
import { MovieMatches } from "@/components/movie-detail/movie-matches";
import { MovieProviders } from "@/components/movie-detail/movie-providers";
import { RecommendationBanner } from "@/components/movie-detail/recommendation-banner";
import { useDefaultHeaderOptions } from "@/lib/navigation";
import { trpc } from "@/lib/trpc";
import { capture } from "@/lib/analytics";
import { Colors, spacing } from "@/lib/constants";

function isNotFoundError(error: unknown): boolean {
	return (
		error instanceof TRPCClientError &&
		(error.data?.httpStatus === 404 || error.data?.code === "NOT_FOUND")
	);
}

export default function MovieDetailScreen() {
	const { id } = useLocalSearchParams<{ id: string }>();
	const router = useRouter();
	const headerOptions = useDefaultHeaderOptions();
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

	const year = movie.releaseDate?.slice(0, 4) ?? null;
	const hours = movie.runtime ? Math.floor(movie.runtime / 60) : null;
	const mins = movie.runtime ? movie.runtime % 60 : null;
	const rating = movie.tmdbVoteAverage
		? movie.tmdbVoteAverage.toFixed(1)
		: null;
	const trailerUrl =
		movie.trailerKey && movie.trailerSite === "YouTube"
			? `https://www.youtube.com/watch?v=${movie.trailerKey}`
			: null;

	function handleSharePress() {
		setShareVisible(true);
	}

	function handleTrailerPress() {
		if (!trailerUrl) return;
		capture("trailer_viewed", { movie_id: tmdbId });
		Linking.openURL(trailerUrl);
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
				<MovieHero
					backdropPath={movie.backdropPath}
					onBack={() => router.back()}
					onShare={handleSharePress}
				/>

				<MovieInfoRow
					posterPath={movie.posterPath}
					title={movie.title}
					year={year}
					hours={hours}
					mins={mins}
					rating={rating}
					imdbId={movie.imdbId}
					trailerUrl={trailerUrl}
					onTrailerPress={handleTrailerPress}
				/>

				<View style={styles.body}>
					<RecommendationBanner movieId={movie.id} />
					<MovieActions
						movieId={movie.id}
						inWatchlist={movie.inWatchlist}
						isWatched={movie.isWatched}
					/>
					<MovieGenres genres={movie.genres ?? []} />
					<MovieOverview tagline={movie.tagline} overview={movie.overview} />
					<MovieMatches matches={movie.matches} />
					<MovieProviders providers={movie.streamProviders ?? []} />
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
	body: {
		paddingHorizontal: spacing[4],
		paddingTop: spacing[5],
		gap: spacing[5],
	},
});
