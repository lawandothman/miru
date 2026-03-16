import { View, Text, Pressable, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { Colors, fontSize, fontFamily, spacing } from "@/lib/constants";

interface UserStatsProps {
	userId: string;
	followerCount: number;
	followingCount: number;
}

export function UserStats({
	userId,
	followerCount,
	followingCount,
}: UserStatsProps) {
	const router = useRouter();

	return (
		<View style={styles.stats}>
			<Pressable
				style={({ pressed }) => [styles.stat, pressed && styles.pressed]}
				onPress={() => router.push(`/followers/${userId}?tab=followers`)}
			>
				<Text style={styles.statValue}>{followerCount}</Text>
				<Text style={styles.statLabel}>Followers</Text>
			</Pressable>
			<Pressable
				style={({ pressed }) => [styles.stat, pressed && styles.pressed]}
				onPress={() => router.push(`/followers/${userId}?tab=following`)}
			>
				<Text style={styles.statValue}>{followingCount}</Text>
				<Text style={styles.statLabel}>Following</Text>
			</Pressable>
		</View>
	);
}

const styles = StyleSheet.create({
	stats: {
		flexDirection: "row",
		gap: spacing[8],
		marginTop: spacing[2],
	},
	stat: {
		alignItems: "center",
	},
	pressed: {
		opacity: 0.6,
	},
	statValue: {
		fontSize: fontSize.lg,
		fontFamily: fontFamily.sansBold,
		color: Colors.foreground,
	},
	statLabel: {
		fontSize: fontSize.xs,
		color: Colors.mutedForeground,
	},
});
