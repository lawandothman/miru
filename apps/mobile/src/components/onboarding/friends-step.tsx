import { useState } from "react";
import { View, Text, TextInput, FlatList, StyleSheet } from "react-native";
import { Search } from "lucide-react-native";
import { Spinner } from "@/components/spinner";
import { trpc } from "@/lib/trpc";
import { UserAvatar } from "@/components/user-avatar";
import { FollowButton } from "@/components/follow-button";
import { fontSize, fontFamily, spacing, radius } from "@/lib/constants";
import { useTheme, useThemedStyles, type ThemeColors } from "@/lib/theme";

export function FriendsStep() {
	const [search, setSearch] = useState("");
	const { colors } = useTheme();
	const styles = useThemedStyles(createStyles);

	const { data: searchResults, isLoading: searchLoading } =
		trpc.social.searchUsers.useQuery(
			{ query: search },
			{ enabled: search.length >= 2 },
		);

	return (
		<View style={styles.container}>
			<View style={styles.header}>
				<Text style={styles.title}>Find your friends</Text>
				<Text style={styles.subtitle}>
					Follow friends to see their watchlists and find matches faster.
				</Text>
			</View>

			<View style={styles.searchContainer}>
				<View style={styles.searchBar}>
					<Search size={18} color={colors.mutedForeground} />
					<TextInput
						style={styles.searchInput}
						value={search}
						onChangeText={setSearch}
						placeholder="Search by name"
						placeholderTextColor={colors.mutedForeground}
						autoCapitalize="none"
						autoCorrect={false}
					/>
				</View>
			</View>

			{search.length < 2 ? (
				<View style={styles.emptyContainer}>
					<Text style={styles.emptyText}>
						Type at least 2 letters to find people already on Miru.
					</Text>
				</View>
			) : searchLoading ? (
				<View style={styles.loadingContainer}>
					<Spinner size={32} color={colors.primary} />
				</View>
			) : (
				<FlatList
					data={searchResults}
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
							</View>
							<FollowButton userId={item.id} isFollowing={item.isFollowing} />
						</View>
					)}
					ListEmptyComponent={
						<View style={styles.emptyContainer}>
							<Text style={styles.emptyText}>
								No people found. Try another name.
							</Text>
						</View>
					}
				/>
			)}
		</View>
	);
}

const createStyles = (colors: ThemeColors) =>
	StyleSheet.create({
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
			color: colors.foreground,
		},
		subtitle: {
			fontSize: fontSize.base,
			fontFamily: fontFamily.sans,
			color: colors.mutedForeground,
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
			backgroundColor: colors.card,
			borderRadius: radius.lg,
			paddingHorizontal: spacing[3],
			paddingVertical: spacing[2],
			borderWidth: 1,
			borderColor: colors.border,
		},
		searchInput: {
			flex: 1,
			fontSize: fontSize.base,
			fontFamily: fontFamily.sans,
			color: colors.foreground,
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
			backgroundColor: colors.card,
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
			color: colors.foreground,
		},
		userMeta: {
			fontSize: fontSize.xs,
			fontFamily: fontFamily.sans,
			color: colors.mutedForeground,
		},
		emptyContainer: {
			paddingVertical: spacing[12],
			alignItems: "center",
		},
		emptyText: {
			fontSize: fontSize.sm,
			fontFamily: fontFamily.sans,
			color: colors.mutedForeground,
			textAlign: "center",
		},
	});
