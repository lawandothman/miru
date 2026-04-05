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

interface NotificationData {
	movieId?: string;
	movieTitle?: string;
	posterPath?: string | null;
}

export interface NotificationItemData {
	id: string;
	type: string;
	read: boolean;
	createdAt: Date;
	data: NotificationData | null;
	actor: NotificationActor;
}

export function NotificationItem({ item }: { item: NotificationItemData }) {
	const router = useRouter();
	const data = item.data as NotificationData | null;

	function handlePress() {
		if (item.type === "new-follower") {
			router.push(`/user/${item.actor.id}`);
		} else if (item.type === "watchlist-match" && data?.movieId) {
			router.push(`/movie/${data.movieId}`);
		}
	}

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
						you.{" "}
						<Text style={styles.time}>
							{formatDistanceToNowStrict(item.createdAt, { addSuffix: true })}
						</Text>
					</Text>
				) : (
					<Text style={styles.text} numberOfLines={2}>
						<Text style={styles.bold}>{item.actor.name}</Text> also wants to
						watch{" "}
						<Text style={styles.bold}>{data?.movieTitle ?? "a movie"}</Text>!{" "}
						<Text style={styles.time}>
							{formatDistanceToNowStrict(item.createdAt, { addSuffix: true })}
						</Text>
					</Text>
				)}
			</View>

			<View style={styles.trailing}>
				{item.type === "new-follower" ? (
					<FollowButton userId={item.actor.id} isFollowing={false} />
				) : data?.posterPath ? (
					<Image
						source={{ uri: posterUrl(data.posterPath) }}
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
