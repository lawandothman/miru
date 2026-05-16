import { useRouter } from "expo-router";
import { Search, Send, UserPlus } from "lucide-react-native";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Colors, fontFamily, fontSize, radius, spacing } from "@/lib/constants";
import { shareInviteLink } from "@/lib/invite";

export function FindFriendsEmptyState() {
	const router = useRouter();

	async function handleInvite() {
		try {
			await shareInviteLink("home_empty_state");
		} catch {}
	}

	return (
		<View style={styles.container}>
			<View style={styles.hero}>
				<View style={styles.iconWrap}>
					<UserPlus size={28} color={Colors.primary} />
				</View>
				<Text style={styles.title}>Find your friends</Text>
				<Text style={styles.subtitle}>
					Follow friends to see what you can watch together. Matches show up
					here automatically.
				</Text>
			</View>

			<View style={styles.actions}>
				<Pressable
					style={({ pressed }) => [styles.primary, pressed && styles.pressed]}
					onPress={() => router.push("/(tabs)/search")}
					accessibilityRole="button"
					accessibilityLabel="Find friends to follow"
				>
					<Search size={18} color={Colors.primaryForeground} />
					<Text style={styles.primaryText}>Find friends to follow</Text>
				</Pressable>

				<Pressable
					style={({ pressed }) => [styles.secondary, pressed && styles.pressed]}
					onPress={handleInvite}
					accessibilityRole="button"
					accessibilityLabel="Invite a friend to Miru"
				>
					<Send size={18} color={Colors.foreground} />
					<Text style={styles.secondaryText}>Invite a friend to Miru</Text>
				</Pressable>
			</View>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		gap: spacing[6],
		paddingTop: spacing[8],
	},
	hero: {
		alignItems: "center",
		gap: spacing[2],
		paddingHorizontal: spacing[4],
	},
	iconWrap: {
		width: 56,
		height: 56,
		borderRadius: 28,
		alignItems: "center",
		justifyContent: "center",
		backgroundColor: Colors.card,
		marginBottom: spacing[2],
	},
	title: {
		fontSize: fontSize.xl,
		fontFamily: fontFamily.sansSemibold,
		color: Colors.foreground,
	},
	subtitle: {
		fontSize: fontSize.sm,
		fontFamily: fontFamily.sans,
		color: Colors.mutedForeground,
		textAlign: "center",
		lineHeight: 20,
		paddingHorizontal: spacing[4],
	},
	actions: {
		gap: spacing[3],
	},
	primary: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "center",
		gap: spacing[2],
		backgroundColor: Colors.primary,
		paddingVertical: spacing[3],
		borderRadius: radius.lg,
	},
	primaryText: {
		color: Colors.primaryForeground,
		fontSize: fontSize.base,
		fontFamily: fontFamily.sansSemibold,
	},
	secondary: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "center",
		gap: spacing[2],
		backgroundColor: Colors.card,
		paddingVertical: spacing[3],
		borderRadius: radius.lg,
		borderWidth: 1,
		borderColor: Colors.border,
	},
	secondaryText: {
		color: Colors.foreground,
		fontSize: fontSize.base,
		fontFamily: fontFamily.sansSemibold,
	},
	pressed: {
		opacity: 0.8,
	},
});
