import { Alert, View, Pressable, Text, StyleSheet } from "react-native";
import { Bookmark, BookmarkPlus, Eye } from "lucide-react-native";
import { trpc } from "@/lib/trpc";
import { useOptimisticMovieMutation } from "@/hooks/use-optimistic-movie-mutation";
import { Colors, fontSize, fontFamily, spacing, radius } from "@/lib/constants";
import { triggerWatchlistHaptic, triggerWatchedHaptic } from "@/lib/haptics";
import { useIsOnline } from "@/lib/network";

interface MovieActionsProps {
	movieId: number;
	inWatchlist: boolean;
	isWatched: boolean;
}

export function MovieActions({
	movieId,
	inWatchlist,
	isWatched,
}: MovieActionsProps) {
	const isOnline = useIsOnline();

	const addToWatchlist = trpc.watchlist.add.useMutation(
		useOptimisticMovieMutation({
			movieId,
			patch: (m) => ({ ...m, inWatchlist: true }),
			analyticsEvent: "movie_added_to_watchlist",
		}),
	);

	const removeFromWatchlist = trpc.watchlist.remove.useMutation(
		useOptimisticMovieMutation({
			movieId,
			patch: (m) => ({ ...m, inWatchlist: false }),
			analyticsEvent: "movie_removed_from_watchlist",
		}),
	);

	const addToWatched = trpc.watched.add.useMutation(
		useOptimisticMovieMutation({
			movieId,
			patch: (m) => ({ ...m, isWatched: true, inWatchlist: false }),
			analyticsEvent: "movie_marked_watched",
		}),
	);

	const removeFromWatched = trpc.watched.remove.useMutation(
		useOptimisticMovieMutation({
			movieId,
			patch: (m) => ({ ...m, isWatched: false }),
			analyticsEvent: "movie_unmarked_watched",
		}),
	);

	function handleWatchlistToggle() {
		if (!isOnline) {
			Alert.alert(
				"No internet",
				"Connect to the internet to update your watchlist.",
			);
			return;
		}

		triggerWatchlistHaptic();

		if (inWatchlist) {
			removeFromWatchlist.mutate({ movieId });
		} else {
			addToWatchlist.mutate({ movieId });
		}
	}

	function handleWatchedToggle() {
		if (!isOnline) {
			Alert.alert(
				"No internet",
				"Connect to the internet to update your watched list.",
			);
			return;
		}

		triggerWatchedHaptic();

		if (isWatched) {
			removeFromWatched.mutate({ movieId });
		} else {
			addToWatched.mutate({ movieId });
		}
	}

	return (
		<View style={styles.container}>
			<Pressable
				style={({ pressed }) => [
					styles.button,
					inWatchlist && styles.buttonActive,
					pressed && styles.pressed,
					!isOnline && styles.offline,
				]}
				onPress={handleWatchlistToggle}
				accessibilityRole="button"
				accessibilityLabel={
					inWatchlist ? "Remove from watchlist" : "Add to watchlist"
				}
			>
				{inWatchlist ? (
					<Bookmark
						size={18}
						color={Colors.primaryForeground}
						fill={Colors.primaryForeground}
					/>
				) : (
					<BookmarkPlus size={18} color={Colors.foreground} />
				)}
				<Text
					style={[styles.buttonText, inWatchlist && styles.buttonTextActive]}
				>
					{inWatchlist ? "In Watchlist" : "Add to Watchlist"}
				</Text>
			</Pressable>

			<Pressable
				style={({ pressed }) => [
					styles.button,
					isWatched && styles.buttonActive,
					pressed && styles.pressed,
					!isOnline && styles.offline,
				]}
				onPress={handleWatchedToggle}
				accessibilityRole="button"
				accessibilityLabel={
					isWatched ? "Remove from watched" : "Mark as watched"
				}
			>
				<Eye
					size={18}
					color={isWatched ? Colors.primaryForeground : Colors.foreground}
				/>
				<Text style={[styles.buttonText, isWatched && styles.buttonTextActive]}>
					Watched
				</Text>
			</Pressable>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flexDirection: "row",
		gap: spacing[3],
	},
	button: {
		flex: 1,
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "center",
		gap: spacing[2],
		paddingVertical: spacing[3],
		borderRadius: radius.lg,
		backgroundColor: Colors.secondary,
	},
	buttonActive: {
		backgroundColor: Colors.primary,
	},
	pressed: {
		opacity: 0.8,
	},
	offline: {
		opacity: 0.5,
	},
	buttonText: {
		fontSize: fontSize.sm,
		fontFamily: fontFamily.sansSemibold,
		color: Colors.foreground,
	},
	buttonTextActive: {
		color: Colors.primaryForeground,
	},
});
