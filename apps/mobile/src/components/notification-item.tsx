import type { TypedNotificationData } from "@miru/trpc";
import { formatDistanceToNowStrict } from "date-fns";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { match } from "ts-pattern";
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
	isFollowing?: boolean;
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
		match(item)
			.with({ type: "new-follower" }, (n) => router.push(`/user/${n.actor.id}`))
			.with({ type: "watchlist-match" }, (n) =>
				router.push(`/movie/${n.data.movieId}`),
			)
			.with({ type: "movie-recommendation" }, (n) =>
				router.push(`/movie/${n.data.movieId}`),
			)
			.exhaustive();
	}

	const time = (
		<Text style={styles.time}>
			{formatDistanceToNowStrict(item.createdAt, { addSuffix: true })}
		</Text>
	);

	const trailingPoster = (path: string | null) =>
		path ? (
			<Image
				source={{ uri: posterUrl(path) }}
				style={styles.poster}
				contentFit="cover"
			/>
		) : null;

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
				) : item.type === "watchlist-match" ? (
					<Text style={styles.text} numberOfLines={2}>
						<Text style={styles.bold}>{item.actor.name}</Text> also wants to
						watch <Text style={styles.bold}>{item.data.movieTitle}</Text>!{" "}
						{time}
					</Text>
				) : (
					<Text style={styles.text} numberOfLines={2}>
						<Text style={styles.bold}>{item.actor.name}</Text> recommended{" "}
						<Text style={styles.bold}>{item.data.movieTitle}</Text>. {time}
					</Text>
				)}
			</View>

			<View style={styles.trailing}>
				{item.type === "new-follower" ? (
					<FollowButton
						userId={item.actor.id}
						isFollowing={item.actor.isFollowing ?? false}
					/>
				) : (
					trailingPoster(item.data.posterPath)
				)}
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
