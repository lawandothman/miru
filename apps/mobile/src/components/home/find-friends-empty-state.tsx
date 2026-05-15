import { useState } from "react";
import {
	FlatList,
	Pressable,
	StyleSheet,
	Text,
	TextInput,
	View,
} from "react-native";
import { Search, Send, UserPlus } from "lucide-react-native";
import { FollowButton } from "@/components/follow-button";
import { Spinner } from "@/components/spinner";
import { UserAvatar } from "@/components/user-avatar";
import { useSession } from "@/lib/auth";
import { Colors, fontFamily, fontSize, radius, spacing } from "@/lib/constants";
import { shareInviteLink } from "@/lib/invite";
import { trpc } from "@/lib/trpc";

export function FindFriendsEmptyState() {
	const { data: session } = useSession();
	const [search, setSearch] = useState("");

	const { data: searchResults, isLoading: searchLoading } =
		trpc.social.searchUsers.useQuery(
			{ query: search },
			{ enabled: search.length >= 2 },
		);

	async function handleInvite() {
		if (!session?.user?.id) return;
		try {
			await shareInviteLink(session.user.id, "home_empty_state");
		} catch {
			// User cancelled or share unavailable — no-op
		}
	}

	const showSearchResults = search.length >= 2;

	return (
		<View style={styles.container}>
			<View style={styles.hero}>
				<View style={styles.iconWrap}>
					<UserPlus size={28} color={Colors.primary} />
				</View>
				<Text style={styles.title}>Find your people</Text>
				<Text style={styles.subtitle}>
					Follow friends to see what you can watch together. Matches show up
					here automatically.
				</Text>
			</View>

			<View style={styles.searchBar}>
				<Search size={18} color={Colors.mutedForeground} />
				<TextInput
					style={styles.searchInput}
					value={search}
					onChangeText={setSearch}
					placeholder="Search by name"
					placeholderTextColor={Colors.mutedForeground}
					autoCapitalize="none"
					autoCorrect={false}
				/>
			</View>

			{showSearchResults ? (
				searchLoading ? (
					<View style={styles.loading}>
						<Spinner size={28} color={Colors.primary} />
					</View>
				) : (
					<FlatList
						data={searchResults}
						keyExtractor={(item) => item.id}
						contentContainerStyle={styles.list}
						showsVerticalScrollIndicator={false}
						renderItem={({ item }) => (
							<View style={styles.userRow}>
								<UserAvatar imageUrl={item.image} name={item.name} size={44} />
								<View style={styles.userInfo}>
									<Text style={styles.userName} numberOfLines={1}>
										{item.name}
									</Text>
								</View>
								<FollowButton
									userId={item.id}
									isFollowing={item.isFollowing}
								/>
							</View>
						)}
						ListEmptyComponent={
							<Text style={styles.emptyText}>
								No people found. Try another name.
							</Text>
						}
					/>
				)
			) : null}

			<Pressable
				style={({ pressed }) => [
					styles.inviteButton,
					pressed && styles.pressed,
				]}
				onPress={handleInvite}
				accessibilityRole="button"
				accessibilityLabel="Invite a friend to Miru"
			>
				<Send size={18} color={Colors.primaryForeground} />
				<Text style={styles.inviteText}>Invite a friend to Miru</Text>
			</Pressable>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		gap: spacing[4],
	},
	hero: {
		alignItems: "center",
		gap: spacing[2],
		paddingTop: spacing[6],
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
	searchBar: {
		flexDirection: "row",
		alignItems: "center",
		gap: spacing[2],
		backgroundColor: Colors.card,
		borderRadius: radius.lg,
		paddingHorizontal: spacing[3],
		paddingVertical: spacing[2],
		borderWidth: 1,
		borderColor: Colors.border,
	},
	searchInput: {
		flex: 1,
		fontSize: fontSize.base,
		fontFamily: fontFamily.sans,
		color: Colors.foreground,
		paddingVertical: spacing[1],
	},
	loading: {
		alignItems: "center",
		paddingVertical: spacing[6],
	},
	list: {
		gap: spacing[3],
		paddingBottom: spacing[2],
	},
	userRow: {
		flexDirection: "row",
		alignItems: "center",
		gap: spacing[3],
		backgroundColor: Colors.card,
		borderRadius: radius.xl,
		padding: spacing[3],
	},
	userInfo: {
		flex: 1,
		gap: 2,
	},
	userName: {
		fontSize: fontSize.base,
		fontFamily: fontFamily.sansMedium,
		color: Colors.foreground,
	},
	emptyText: {
		fontSize: fontSize.sm,
		fontFamily: fontFamily.sans,
		color: Colors.mutedForeground,
		textAlign: "center",
		paddingVertical: spacing[8],
	},
	inviteButton: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "center",
		gap: spacing[2],
		backgroundColor: Colors.primary,
		paddingVertical: spacing[3],
		borderRadius: radius.lg,
		marginTop: "auto",
	},
	pressed: {
		opacity: 0.8,
	},
	inviteText: {
		color: Colors.primaryForeground,
		fontSize: fontSize.base,
		fontFamily: fontFamily.sansSemibold,
	},
});
