import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Check, MessageSquareQuote, X } from "lucide-react-native";
import { UserAvatar } from "@/components/user-avatar";
import { capture } from "@/lib/analytics";
import { Colors, fontFamily, fontSize, radius, spacing } from "@/lib/constants";
import { triggerWatchlistHaptic } from "@/lib/haptics";
import { trpc } from "@/lib/trpc";

interface RecommendationBannerProps {
	movieId: number;
}

export function RecommendationBanner({ movieId }: RecommendationBannerProps) {
	const utils = trpc.useUtils();
	const { data } = trpc.recommendation.getForMovie.useQuery({ movieId });
	const [pendingAction, setPendingAction] = useState<
		"accept" | "dismiss" | null
	>(null);

	const respond = trpc.recommendation.respond.useMutation({
		onMutate: async ({ action }) => {
			setPendingAction(action);
			await utils.recommendation.getForMovie.cancel({ movieId });
			const previous = utils.recommendation.getForMovie.getData({ movieId });
			utils.recommendation.getForMovie.setData({ movieId }, null);
			return { previous };
		},
		onError: (_err, _vars, context) => {
			if (context?.previous !== undefined) {
				utils.recommendation.getForMovie.setData({ movieId }, context.previous);
			}
		},
		onSuccess: (_result, { action }) => {
			capture(
				action === "accept"
					? "movie_recommendation_accepted"
					: "movie_recommendation_dismissed",
				{ movie_id: movieId },
			);
			if (action === "accept") {
				utils.movie.getById.invalidate({ tmdbId: movieId });
				utils.watchlist.getMyWatchlist.invalidate();
			}
		},
		onSettled: () => {
			setPendingAction(null);
			utils.recommendation.getForMovie.invalidate({ movieId });
		},
	});

	if (!data) {
		return null;
	}

	function handleAccept() {
		if (respond.isPending || !data) return;
		triggerWatchlistHaptic();
		respond.mutate({ recommendationId: data.id, action: "accept" });
	}

	function handleDismiss() {
		if (respond.isPending || !data) return;
		respond.mutate({ recommendationId: data.id, action: "dismiss" });
	}

	const senderFirstName = data.sender.name?.split(" ")[0] ?? "someone";

	return (
		<View style={styles.container}>
			<View style={styles.header}>
				<UserAvatar
					imageUrl={data.sender.image}
					name={data.sender.name}
					size={36}
				/>
				<View style={styles.headerText}>
					<Text style={styles.label}>
						<Text style={styles.bold}>{senderFirstName}</Text> recommended this
					</Text>
				</View>
			</View>

			{data.message ? (
				<View style={styles.noteRow}>
					<MessageSquareQuote
						size={16}
						color={Colors.mutedForeground}
						style={styles.quoteIcon}
					/>
					<Text style={styles.note}>{data.message}</Text>
				</View>
			) : null}

			<View style={styles.actions}>
				<Pressable
					style={({ pressed }) => [
						styles.acceptBtn,
						pressed && !respond.isPending && styles.btnPressed,
						respond.isPending && styles.btnDisabled,
					]}
					onPress={handleAccept}
					disabled={respond.isPending}
					accessibilityRole="button"
					accessibilityLabel="Add to watchlist"
				>
					<Check size={16} color={Colors.primaryForeground} />
					<Text style={styles.acceptLabel}>
						{pendingAction === "accept" ? "Adding…" : "Add to watchlist"}
					</Text>
				</Pressable>

				<Pressable
					style={({ pressed }) => [
						styles.dismissBtn,
						pressed && !respond.isPending && styles.btnPressed,
						respond.isPending && styles.btnDisabled,
					]}
					onPress={handleDismiss}
					disabled={respond.isPending}
					accessibilityRole="button"
					accessibilityLabel="Dismiss recommendation"
				>
					<X size={16} color={Colors.foreground} />
					<Text style={styles.dismissLabel}>
						{pendingAction === "dismiss" ? "Dismissing…" : "Dismiss"}
					</Text>
				</Pressable>
			</View>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		backgroundColor: Colors.card,
		borderRadius: radius.xl,
		borderWidth: 1,
		borderColor: Colors.border,
		padding: spacing[4],
		gap: spacing[3],
	},
	header: {
		flexDirection: "row",
		alignItems: "center",
		gap: spacing[3],
	},
	headerText: {
		flex: 1,
	},
	label: {
		fontSize: fontSize.sm,
		fontFamily: fontFamily.sans,
		color: Colors.foreground,
		lineHeight: 20,
	},
	bold: {
		fontFamily: fontFamily.sansSemibold,
	},
	noteRow: {
		flexDirection: "row",
		gap: spacing[2],
		paddingLeft: spacing[1],
	},
	quoteIcon: {
		marginTop: 2,
	},
	note: {
		flex: 1,
		fontSize: fontSize.sm,
		fontFamily: fontFamily.sans,
		fontStyle: "italic",
		color: Colors.mutedForeground,
		lineHeight: 20,
	},
	actions: {
		flexDirection: "row",
		gap: spacing[2],
	},
	acceptBtn: {
		flex: 1,
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "center",
		gap: spacing[2],
		paddingVertical: spacing[2.5],
		borderRadius: radius.lg,
		backgroundColor: Colors.primary,
	},
	dismissBtn: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "center",
		gap: spacing[2],
		paddingVertical: spacing[2.5],
		paddingHorizontal: spacing[4],
		borderRadius: radius.lg,
		backgroundColor: Colors.secondary,
	},
	btnPressed: {
		opacity: 0.8,
	},
	btnDisabled: {
		opacity: 0.5,
	},
	acceptLabel: {
		fontSize: fontSize.sm,
		fontFamily: fontFamily.sansSemibold,
		color: Colors.primaryForeground,
	},
	dismissLabel: {
		fontSize: fontSize.sm,
		fontFamily: fontFamily.sansMedium,
		color: Colors.foreground,
	},
});
