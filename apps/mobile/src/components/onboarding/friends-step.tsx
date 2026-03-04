import { useState } from "react";
import {
	View,
	Text,
	TextInput,
	FlatList,
	ActivityIndicator,
	StyleSheet,
} from "react-native";
import { Search } from "lucide-react-native";
import { trpc } from "@/lib/trpc";
import { UserAvatar } from "@/components/user-avatar";
import { FollowButton } from "@/components/follow-button";
import { Colors, fontSize, fontFamily, spacing, radius } from "@/lib/constants";

export function FriendsStep() {
	const [search, setSearch] = useState("");

	const { data: suggested, isLoading: suggestedLoading } =
		trpc.onboarding.getSuggestedUsers.useQuery();

	const { data: searchResults, isLoading: searchLoading } =
		trpc.social.searchUsers.useQuery(
			{ query: search },
			{ enabled: search.length >= 2 },
		);

	const users = search.length >= 2 ? searchResults : suggested;
	const isLoading = search.length >= 2 ? searchLoading : suggestedLoading;

	return (
		<View style={styles.container}>
			<View style={styles.header}>
				<Text style={styles.title}>Find friends</Text>
				<Text style={styles.subtitle}>
					Follow people to see what they&apos;re watching. You can skip this
					step.
				</Text>
			</View>

			<View style={styles.searchContainer}>
				<View style={styles.searchBar}>
					<Search size={18} color={Colors.mutedForeground} />
					<TextInput
						style={styles.searchInput}
						value={search}
						onChangeText={setSearch}
						placeholder="Search by name..."
						placeholderTextColor={Colors.mutedForeground}
						autoCapitalize="none"
						autoCorrect={false}
					/>
				</View>
			</View>

			{isLoading ? (
				<View style={styles.loadingContainer}>
					<ActivityIndicator color={Colors.primary} size="large" />
				</View>
			) : (
				<FlatList
					data={users}
					keyExtractor={(item) => item.id}
					contentContainerStyle={styles.listContent}
					showsVerticalScrollIndicator={false}
					renderItem={({ item }) => (
						<View style={styles.userRow}>
							<UserAvatar imageUrl={item.image} name={item.name} size={44} />
							<View style={styles.userInfo}>
								<Text style={styles.userName} numberOfLines={1}>
									{item.name}
								</Text>
								{"watchlistCount" in item && (
									<Text style={styles.userMeta}>
										{String(item.watchlistCount)} in watchlist
									</Text>
								)}
							</View>
							<FollowButton userId={item.id} isFollowing={item.isFollowing} />
						</View>
					)}
					ListEmptyComponent={
						<View style={styles.emptyContainer}>
							<Text style={styles.emptyText}>
								{search.length >= 2 ? "No users found" : "No suggestions yet"}
							</Text>
						</View>
					}
				/>
			)}
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
	},
	header: {
		paddingHorizontal: spacing[4],
		gap: spacing[2],
	},
	title: {
		fontSize: fontSize["2xl"],
		fontFamily: fontFamily.displayBold,
		color: Colors.foreground,
	},
	subtitle: {
		fontSize: fontSize.base,
		fontFamily: fontFamily.sans,
		color: Colors.mutedForeground,
		lineHeight: 22,
	},
	searchContainer: {
		paddingHorizontal: spacing[4],
		paddingTop: spacing[4],
		paddingBottom: spacing[2],
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
	loadingContainer: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
	},
	listContent: {
		padding: spacing[4],
		gap: spacing[3],
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
	userMeta: {
		fontSize: fontSize.xs,
		fontFamily: fontFamily.sans,
		color: Colors.mutedForeground,
	},
	emptyContainer: {
		paddingVertical: spacing[12],
		alignItems: "center",
	},
	emptyText: {
		fontSize: fontSize.sm,
		fontFamily: fontFamily.sans,
		color: Colors.mutedForeground,
	},
});
