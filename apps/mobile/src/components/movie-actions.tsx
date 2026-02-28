import { View, Pressable, Text, StyleSheet } from "react-native";
import { Bookmark, BookmarkPlus, Eye } from "lucide-react-native";
import { trpc } from "@/lib/trpc";
import { Colors, fontSize, fontFamily, spacing, radius } from "@/lib/constants";

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

	function invalidate() {
		utils.watchlist.getMyWatchlist.invalidate();
		utils.watched.getMyWatched.invalidate();
		utils.movie.getById.invalidate({ tmdbId: movieId });
		utils.social.getDashboardMatches.invalidate();
		utils.social.getMatchesWith.invalidate();
	}

	const addToWatchlist = trpc.watchlist.add.useMutation({
		onSuccess: invalidate,
	});
	const removeFromWatchlist = trpc.watchlist.remove.useMutation({
		onSuccess: invalidate,
	});
	const addToWatched = trpc.watched.add.useMutation({
		onSuccess: invalidate,
	});
	const removeFromWatched = trpc.watched.remove.useMutation({
		onSuccess: invalidate,
	});

	function handleWatchlistToggle() {
		if (inWatchlist) {
			removeFromWatchlist.mutate({ movieId });
		} else {
			addToWatchlist.mutate({ movieId });
		}
	}

	function handleWatchedToggle() {
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
				]}
				onPress={handleWatchlistToggle}
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
				]}
				onPress={handleWatchedToggle}
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
	buttonText: {
		fontSize: fontSize.sm,
		fontFamily: fontFamily.sansSemibold,
		color: Colors.foreground,
	},
	buttonTextActive: {
		color: Colors.primaryForeground,
	},
});
