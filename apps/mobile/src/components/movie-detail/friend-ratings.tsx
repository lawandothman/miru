import { View, Text, Pressable, ScrollView, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import type { RouterOutputs } from "@miru/trpc";
import { UserAvatar } from "@/components/user-avatar";
import { RatingBadge } from "@/components/rating-badge";
import { RATING_META } from "@/lib/ratings";
import { Colors, fontSize, fontFamily, spacing } from "@/lib/constants";

type FriendRating = RouterOutputs["movie"]["getById"]["friendRatings"][number];

interface FriendRatingsProps {
	ratings: FriendRating[];
}

export function FriendRatings({ ratings }: FriendRatingsProps) {
	const router = useRouter();

	if (ratings.length === 0) {
		return null;
	}

	return (
		<View style={styles.section}>
			<Text style={styles.sectionTitle}>Friends' ratings</Text>
			<ScrollView
				horizontal
				showsHorizontalScrollIndicator={false}
				contentContainerStyle={styles.scroll}
			>
				{ratings.map((friend) => (
					<Pressable
						key={friend.id}
						style={({ pressed }) => [styles.card, pressed && styles.pressed]}
						onPress={() => router.push(`/user/${friend.id}`)}
						accessibilityRole="button"
						accessibilityLabel={`${friend.name ?? "Friend"} — ${
							RATING_META[friend.rating].label
						}`}
					>
						<View>
							<UserAvatar
								imageUrl={friend.image}
								name={friend.name}
								size={48}
							/>
							<RatingBadge
								rating={friend.rating}
								size={20}
								style={styles.badge}
							/>
						</View>
						<Text style={styles.name} numberOfLines={1}>
							{friend.name?.split(" ")[0]}
						</Text>
					</Pressable>
				))}
			</ScrollView>
		</View>
	);
}

const styles = StyleSheet.create({
	section: {
		gap: spacing[3],
	},
	sectionTitle: {
		fontSize: fontSize.base,
		fontFamily: fontFamily.displaySemibold,
		color: Colors.foreground,
	},
	scroll: {
		gap: spacing[3],
	},
	card: {
		alignItems: "center",
		gap: spacing[1],
		width: 64,
	},
	badge: {
		position: "absolute",
		bottom: -2,
		right: -2,
	},
	name: {
		fontSize: fontSize.xs,
		fontFamily: fontFamily.sans,
		color: Colors.mutedForeground,
		textAlign: "center",
	},
	pressed: {
		opacity: 0.7,
	},
});
