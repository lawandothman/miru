import { useState } from "react";
import { View, Text, FlatList, Pressable, StyleSheet } from "react-native";
import { useLocalSearchParams, useRouter, Stack } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Spinner } from "@/components/spinner";
import { trpc } from "@/lib/trpc";
import { useSession } from "@/lib/auth";
import { UserAvatar } from "@/components/user-avatar";
import { FollowButton } from "@/components/follow-button";
import { useDefaultHeaderOptions } from "@/lib/navigation";
import { fontSize, fontFamily, spacing } from "@/lib/constants";
import { offsetPageParam } from "@/lib/pagination";
import { useThemedStyles, type ThemeColors } from "@/lib/theme";

const PAGE_SIZE = 20;

type Tab = "followers" | "following";

interface UserRow {
	id: string;
	name: string | null;
	image: string | null | undefined;
	isFollowing: boolean;
}

function UserListItem({ user }: { user: UserRow }) {
	const router = useRouter();
	const { data: session } = useSession();
	const isOwnProfile = session?.user?.id === user.id;
	const styles = useThemedStyles(createStyles);

	return (
		<Pressable
			style={({ pressed }) => [styles.userRow, pressed && styles.pressed]}
			onPress={() => router.push(`/user/${user.id}`)}
		>
			<UserAvatar imageUrl={user.image} name={user.name} size={48} />
			<Text style={styles.userName} numberOfLines={1}>
				{user.name}
			</Text>
			{!isOwnProfile && (
				<FollowButton userId={user.id} isFollowing={user.isFollowing} />
			)}
		</Pressable>
	);
}

export default function FollowersScreen() {
	const { userId, tab } = useLocalSearchParams<{
		userId: string;
		tab?: string;
	}>();
	const [activeTab, setActiveTab] = useState<Tab>(
		tab === "following" ? "following" : "followers",
	);
	const styles = useThemedStyles(createStyles);

	const { data: profile } = trpc.user.getById.useQuery(
		{ id: userId ?? "" },
		{ enabled: Boolean(userId) },
	);

	const followersQuery = trpc.social.getFollowers.useInfiniteQuery(
		{ userId: userId ?? "", limit: PAGE_SIZE },
		{ enabled: Boolean(userId), getNextPageParam: offsetPageParam(PAGE_SIZE) },
	);

	const followingQuery = trpc.social.getFollowing.useInfiniteQuery(
		{ userId: userId ?? "", limit: PAGE_SIZE },
		{ enabled: Boolean(userId), getNextPageParam: offsetPageParam(PAGE_SIZE) },
	);

	const activeQuery =
		activeTab === "followers" ? followersQuery : followingQuery;
	const activeData = activeQuery.data?.pages.flat() ?? [];
	const isLoading = activeQuery.isLoading;
	const headerOptions = useDefaultHeaderOptions();

	return (
		<>
			<Stack.Screen
				options={{
					...headerOptions,
					title: profile?.name ?? "",
				}}
			/>
			<SafeAreaView style={styles.container} edges={[]}>
				{/* Tabs */}
				<View style={styles.tabs}>
					<Pressable
						style={[styles.tab, activeTab === "followers" && styles.tabActive]}
						onPress={() => setActiveTab("followers")}
					>
						<Text
							style={[
								styles.tabText,
								activeTab === "followers" && styles.tabTextActive,
							]}
						>
							{profile?.followerCount ?? 0} followers
						</Text>
					</Pressable>
					<Pressable
						style={[styles.tab, activeTab === "following" && styles.tabActive]}
						onPress={() => setActiveTab("following")}
					>
						<Text
							style={[
								styles.tabText,
								activeTab === "following" && styles.tabTextActive,
							]}
						>
							{profile?.followingCount ?? 0} following
						</Text>
					</Pressable>
				</View>

				{/* List */}
				{isLoading ? (
					<View style={styles.loading}>
						<Spinner />
					</View>
				) : (
					<FlatList
						data={activeData}
						keyExtractor={(item) => item.id}
						renderItem={({ item }) => <UserListItem user={item} />}
						contentContainerStyle={styles.list}
						onEndReachedThreshold={0.5}
						onEndReached={() => {
							if (activeQuery.hasNextPage && !activeQuery.isFetchingNextPage) {
								activeQuery.fetchNextPage();
							}
						}}
						ListFooterComponent={
							activeQuery.isFetchingNextPage ? (
								<View style={styles.footer}>
									<Spinner />
								</View>
							) : null
						}
						ListEmptyComponent={
							<View style={styles.empty}>
								<Text style={styles.emptyText}>
									{activeTab === "followers"
										? "No followers yet"
										: "Not following anyone yet"}
								</Text>
							</View>
						}
					/>
				)}
			</SafeAreaView>
		</>
	);
}

const createStyles = (colors: ThemeColors) =>
	StyleSheet.create({
		container: {
			flex: 1,
			backgroundColor: colors.background,
		},
		tabs: {
			flexDirection: "row",
			borderBottomWidth: 1,
			borderBottomColor: colors.border,
		},
		tab: {
			flex: 1,
			paddingVertical: spacing[3],
			alignItems: "center",
			borderBottomWidth: 2,
			borderBottomColor: "transparent",
		},
		tabActive: {
			borderBottomColor: colors.foreground,
		},
		tabText: {
			fontSize: fontSize.sm,
			fontFamily: fontFamily.sansMedium,
			color: colors.mutedForeground,
		},
		tabTextActive: {
			color: colors.foreground,
			fontFamily: fontFamily.sansSemibold,
		},
		list: {
			paddingVertical: spacing[2],
		},
		userRow: {
			flexDirection: "row",
			alignItems: "center",
			paddingHorizontal: spacing[4],
			paddingVertical: spacing[3],
			gap: spacing[3],
		},
		pressed: {
			opacity: 0.7,
		},
		userName: {
			flex: 1,
			fontSize: fontSize.base,
			fontFamily: fontFamily.sansSemibold,
			color: colors.foreground,
		},
		loading: {
			flex: 1,
			justifyContent: "center",
			alignItems: "center",
		},
		footer: {
			paddingVertical: spacing[4],
			alignItems: "center",
		},
		empty: {
			paddingTop: spacing[12],
			alignItems: "center",
		},
		emptyText: {
			fontSize: fontSize.sm,
			color: colors.mutedForeground,
		},
	});
