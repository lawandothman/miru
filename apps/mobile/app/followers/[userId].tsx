import { useState } from "react";
import {
	View,
	Text,
	FlatList,
	Pressable,
	StyleSheet,
	ActivityIndicator,
} from "react-native";
import { useLocalSearchParams, useRouter, Stack } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { trpc } from "@/lib/trpc";
import { useSession } from "@/lib/auth";
import { UserAvatar } from "@/components/user-avatar";
import { FollowButton } from "@/components/follow-button";
import { defaultHeaderOptions } from "@/lib/navigation";
import { Colors, fontSize, fontFamily, spacing, radius } from "@/lib/constants";

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

	const { data: profile } = trpc.user.getById.useQuery(
		{ id: userId ?? "" },
		{ enabled: Boolean(userId) },
	);

	const { data: followers, isLoading: followersLoading } =
		trpc.social.getFollowers.useQuery(
			{ userId: userId ?? "" },
			{ enabled: Boolean(userId) },
		);

	const { data: following, isLoading: followingLoading } =
		trpc.social.getFollowing.useQuery(
			{ userId: userId ?? "" },
			{ enabled: Boolean(userId) },
		);

	const activeData = activeTab === "followers" ? followers : following;
	const isLoading = activeTab === "followers" ? followersLoading : followingLoading;

	return (
		<>
			<Stack.Screen
				options={{
					...defaultHeaderOptions,
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
						<ActivityIndicator color={Colors.mutedForeground} />
					</View>
				) : (
					<FlatList
						data={activeData ?? []}
						keyExtractor={(item) => item.id}
						renderItem={({ item }) => <UserListItem user={item} />}
						contentContainerStyle={styles.list}
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

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: Colors.background,
	},
	tabs: {
		flexDirection: "row",
		borderBottomWidth: 1,
		borderBottomColor: Colors.border,
	},
	tab: {
		flex: 1,
		paddingVertical: spacing[3],
		alignItems: "center",
		borderBottomWidth: 2,
		borderBottomColor: "transparent",
	},
	tabActive: {
		borderBottomColor: Colors.foreground,
	},
	tabText: {
		fontSize: fontSize.sm,
		fontFamily: fontFamily.sansMedium,
		color: Colors.mutedForeground,
	},
	tabTextActive: {
		color: Colors.foreground,
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
		color: Colors.foreground,
	},
	loading: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
	},
	empty: {
		paddingTop: spacing[12],
		alignItems: "center",
	},
	emptyText: {
		fontSize: fontSize.sm,
		color: Colors.mutedForeground,
	},
});
