import { Alert, View, Pressable, Text, StyleSheet } from "react-native";
import { Bookmark, BookmarkPlus, Eye } from "lucide-react-native";
import { trpc } from "@/lib/trpc";
import { capture } from "@/lib/analytics";
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
	const utils = trpc.useUtils();
	const isOnline = useIsOnline();

	const queryKey = { tmdbId: movieId };

	function invalidate() {
		utils.movie.getById.invalidate(queryKey);
		utils.watchlist.getMyWatchlist.invalidate();
		utils.watched.getMyWatched.invalidate();
		utils.social.getDashboardMatches.invalidate();
		utils.social.getMatchesWith.invalidate();
	}

	const addToWatchlist = trpc.watchlist.add.useMutation({
		onMutate: async () => {
			await utils.movie.getById.cancel(queryKey);
			const previous = utils.movie.getById.getData(queryKey);
			utils.movie.getById.setData(queryKey, (old) =>
				old ? { ...old, inWatchlist: true } : old,
			);
			return { previous };
		},
		onSuccess: () => {
			capture("movie_added_to_watchlist", { movie_id: movieId });
		},
		onError: (_err, _vars, context) => {
			if (context?.previous) {
				utils.movie.getById.setData(queryKey, context.previous);
			}
		},
		onSettled: invalidate,
	});

	const removeFromWatchlist = trpc.watchlist.remove.useMutation({
		onMutate: async () => {
			await utils.movie.getById.cancel(queryKey);
			const previous = utils.movie.getById.getData(queryKey);
			utils.movie.getById.setData(queryKey, (old) =>
				old ? { ...old, inWatchlist: false } : old,
			);
			return { previous };
		},
		onSuccess: () => {
			capture("movie_removed_from_watchlist", { movie_id: movieId });
		},
		onError: (_err, _vars, context) => {
			if (context?.previous) {
				utils.movie.getById.setData(queryKey, context.previous);
			}
		},
		onSettled: invalidate,
	});

	const addToWatched = trpc.watched.add.useMutation({
		onMutate: async () => {
			await utils.movie.getById.cancel(queryKey);
			const previous = utils.movie.getById.getData(queryKey);
			utils.movie.getById.setData(queryKey, (old) =>
				old ? { ...old, isWatched: true, inWatchlist: false } : old,
			);
			return { previous };
		},
		onSuccess: () => {
			capture("movie_marked_watched", { movie_id: movieId });
		},
		onError: (_err, _vars, context) => {
			if (context?.previous) {
				utils.movie.getById.setData(queryKey, context.previous);
			}
		},
		onSettled: invalidate,
	});

	const removeFromWatched = trpc.watched.remove.useMutation({
		onMutate: async () => {
			await utils.movie.getById.cancel(queryKey);
			const previous = utils.movie.getById.getData(queryKey);
			utils.movie.getById.setData(queryKey, (old) =>
				old ? { ...old, isWatched: false } : old,
			);
			return { previous };
		},
		onSuccess: () => {
			capture("movie_unmarked_watched", { movie_id: movieId });
		},
		onError: (_err, _vars, context) => {
			if (context?.previous) {
				utils.movie.getById.setData(queryKey, context.previous);
			}
		},
		onSettled: invalidate,
	});

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
