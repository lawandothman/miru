import { useLocalSearchParams, useNavigation, useRouter } from "expo-router";
import { useLayoutEffect } from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { Search } from "lucide-react-native";
import { trpc } from "@/lib/trpc";
import { MovieGrid } from "@/components/movie-grid";
import { EmptyState } from "@/components/empty-state";
import { UserAvatar } from "@/components/user-avatar";
import { FollowButton } from "@/components/follow-button";
import { Colors, fontSize, fontFamily, spacing } from "@/lib/constants";

export default function SearchResultsScreen() {
	const { q } = useLocalSearchParams<{ q: string }>();
	const navigation = useNavigation();

	useLayoutEffect(() => {
		navigation.setOptions({ title: q ?? "Search" });
	}, [navigation, q]);

	const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } =
		trpc.movie.search.useInfiniteQuery(
			{ query: q ?? "" },
			{
				enabled: Boolean(q),
				getNextPageParam: (lastPage) =>
					lastPage.page < lastPage.totalPages ? lastPage.page + 1 : undefined,
			},
		);

	const users = trpc.social.searchUsers.useQuery(
		{ query: q ?? "" },
		{ enabled: Boolean(q) },
	);

	const movies = data?.pages.flatMap((p) => p.results) ?? [];

	return (
		<MovieGrid
			movies={movies}
			isLoading={isLoading}
			hasNextPage={hasNextPage}
			fetchNextPage={fetchNextPage}
			isFetchingNextPage={isFetchingNextPage}
			ListHeaderComponent={
				users.data && users.data.length > 0 ? (
					<PeopleSection people={users.data} />
				) : undefined
			}
			ListEmptyComponent={
				<EmptyState
					icon={Search}
					title="No results"
					description="Try a different search term."
				/>
			}
		/>
	);
}

interface UserResult {
	id: string;
	name: string | null;
	image: string | null;
	isFollowing: boolean;
}

function PeopleSection({ people }: { people: UserResult[] }) {
	const router = useRouter();

	return (
		<View style={styles.section}>
			<Text style={styles.sectionTitle}>People</Text>
			{people.map((user) => (
				<Pressable
					key={user.id}
					style={({ pressed }) => [styles.userRow, pressed && styles.pressed]}
					onPress={() => router.push(`/user/${user.id}`)}
				>
					<View style={styles.userInfo}>
						<UserAvatar imageUrl={user.image} name={user.name} size={40} />
						<Text style={styles.userName} numberOfLines={1}>
							{user.name ?? "Unknown"}
						</Text>
					</View>
					<FollowButton userId={user.id} isFollowing={user.isFollowing} />
				</Pressable>
			))}
		</View>
	);
}

const styles = StyleSheet.create({
	section: {
		marginBottom: spacing[4],
	},
	sectionTitle: {
		color: Colors.foreground,
		fontSize: fontSize.lg,
		fontFamily: fontFamily.displaySemibold,
		marginBottom: spacing[3],
	},
	userRow: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
		paddingVertical: spacing[2.5],
	},
	pressed: {
		opacity: 0.7,
	},
	userInfo: {
		flexDirection: "row",
		alignItems: "center",
		gap: spacing[3],
		flex: 1,
		marginRight: spacing[3],
	},
	userName: {
		color: Colors.foreground,
		fontSize: fontSize.base,
		fontFamily: fontFamily.sansMedium,
		flex: 1,
	},
});
