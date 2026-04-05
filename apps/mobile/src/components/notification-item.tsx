import type { TypedNotificationData } from "@miru/trpc";
import { formatDistanceToNowStrict } from "date-fns";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { FollowButton } from "@/components/follow-button";
import { UserAvatar } from "@/components/user-avatar";
import {
	Colors,
	fontFamily,
	fontSize,
	posterUrl,
	radius,
	spacing,
} from "@/lib/constants";

interface NotificationActor {
	id: string;
	name: string;
	image: string | null;
}

export type NotificationItemData = TypedNotificationData & {
	id: string;
	read: boolean;
	createdAt: Date;
	actor: NotificationActor;
};

interface NotificationItemProps {
	item: NotificationItemData;
}

export function NotificationItem({ item }: NotificationItemProps) {
	const router = useRouter();

	function handlePress() {
		switch (item.type) {
			case "new-follower":
				router.push(`/user/${item.actor.id}`);
				break;
			case "watchlist-match":
				router.push(`/movie/${item.data.movieId}`);
				break;
		}
	}

	const time = (
		<Text style={styles.time}>
			{formatDistanceToNowStrict(item.createdAt, { addSuffix: true })}
		</Text>
	);

	return (
		<Pressable
			style={[styles.container, !item.read && styles.unread]}
			onPress={handlePress}
		>
			<UserAvatar
				imageUrl={item.actor.image}
				name={item.actor.name}
				size={44}
			/>

			<View style={styles.content}>
				{item.type === "new-follower" ? (
					<Text style={styles.text} numberOfLines={2}>
						<Text style={styles.bold}>{item.actor.name}</Text> started following
						you. {time}
					</Text>
				) : (
					<Text style={styles.text} numberOfLines={2}>
						<Text style={styles.bold}>{item.actor.name}</Text> also wants to
						watch <Text style={styles.bold}>{item.data.movieTitle}</Text>!{" "}
						{time}
					</Text>
				)}
			</View>

			<View style={styles.trailing}>
				{item.type === "new-follower" ? (
					<FollowButton userId={item.actor.id} isFollowing={false} />
				) : item.data.posterPath ? (
					<Image
						source={{ uri: posterUrl(item.data.posterPath) }}
						style={styles.poster}
						contentFit="cover"
					/>
				) : null}
			</View>
		</Pressable>
	);
}

const styles = StyleSheet.create({
	container: {
		flexDirection: "row",
		alignItems: "center",
		paddingHorizontal: spacing[4],
		paddingVertical: spacing[3],
		gap: spacing[3],
	},
	unread: {
		backgroundColor: Colors.card,
	},
	content: {
		flex: 1,
	},
	text: {
		fontSize: fontSize.sm,
		fontFamily: fontFamily.sans,
		color: Colors.foreground,
		lineHeight: 20,
	},
	bold: {
		fontFamily: fontFamily.sansSemibold,
	},
	time: {
		color: Colors.mutedForeground,
	},
	trailing: {
		flexShrink: 0,
	},
	poster: {
		width: 44,
		height: 44,
		borderRadius: radius.sm,
		backgroundColor: Colors.secondary,
	},
});
