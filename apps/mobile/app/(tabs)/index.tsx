import {
	View,
	Text,
	ScrollView,
	RefreshControl,
	Pressable,
	StyleSheet,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Film } from "lucide-react-native";
import { useRouter } from "expo-router";
import { trpc } from "@/lib/trpc";
import { useSession } from "@/lib/auth";
import { MoviePoster } from "@/components/movie-poster";
import { UserAvatar } from "@/components/user-avatar";
import { EmptyState } from "@/components/empty-state";
import { Colors, fontSize, fontFamily, spacing, radius } from "@/lib/constants";

function getGreeting(): string {
	const hour = new Date().getHours();
	if (hour < 12) {
		return "Good morning";
	}
	if (hour < 18) {
		return "Good afternoon";
	}
	return "Good evening";
}

export default function HomeScreen() {
	const { data: session } = useSession();
	const router = useRouter();
	const firstName = session?.user?.name?.split(" ")[0] ?? "";

	const {
		data: matches,
		isLoading,
		refetch,
		isRefetching,
	} = trpc.social.getDashboardMatches.useQuery();

	return (
		<SafeAreaView style={styles.container} edges={["top"]}>
			<ScrollView
				contentContainerStyle={styles.scroll}
				refreshControl={
					<RefreshControl
						refreshing={isRefetching}
						onRefresh={refetch}
						tintColor={Colors.mutedForeground}
					/>
				}
			>
				<Text style={styles.greeting}>
					{getGreeting()}, {firstName}
				</Text>

				{!isLoading && (!matches || matches.length === 0) ? (
					<EmptyState
						icon={Film}
						title="No matches yet"
						description="Follow friends and add movies to your watchlist to see what you can watch together."
						actionLabel="Discover movies"
						onAction={() => router.push("/(tabs)/discover")}
					/>
				) : (
					<View style={styles.matchList}>
						{matches?.map((friend) => (
							<Pressable
								key={friend.id}
								style={styles.friendCard}
								onPress={() => router.push(`/user/${friend.id}`)}
							>
								<View style={styles.friendHeader}>
									<UserAvatar
										imageUrl={friend.image}
										name={friend.name}
										size={36}
									/>
									<View>
										<Text style={styles.friendName}>{friend.name}</Text>
										<Text style={styles.matchCount}>
											{friend.matches.length} match
											{friend.matches.length !== 1 ? "es" : ""}
										</Text>
									</View>
								</View>

								<ScrollView
									horizontal
									showsHorizontalScrollIndicator={false}
									contentContainerStyle={styles.posterRow}
								>
									{friend.matches.map((m) => (
										<MoviePoster
											key={m.id}
											id={m.id}
											posterPath={m.posterPath}
											title={m.title}
											width={90}
											height={135}
										/>
									))}
								</ScrollView>
							</Pressable>
						))}
					</View>
				)}
			</ScrollView>
		</SafeAreaView>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: Colors.background,
	},
	scroll: {
		paddingBottom: spacing[8],
		flexGrow: 1,
	},
	greeting: {
		fontSize: fontSize["2xl"],
		fontFamily: fontFamily.displayBold,
		color: Colors.foreground,
		paddingHorizontal: spacing[4],
		paddingTop: spacing[4],
		paddingBottom: spacing[6],
	},
	matchList: {
		gap: spacing[6],
		paddingHorizontal: spacing[4],
	},
	friendCard: {
		backgroundColor: Colors.card,
		borderRadius: radius.xl,
		padding: spacing[4],
		gap: spacing[3],
	},
	friendHeader: {
		flexDirection: "row",
		alignItems: "center",
		gap: spacing[3],
	},
	friendName: {
		fontSize: fontSize.base,
		fontFamily: fontFamily.sansSemibold,
		color: Colors.foreground,
	},
	matchCount: {
		fontSize: fontSize.xs,
		color: Colors.mutedForeground,
	},
	posterRow: {
		gap: spacing[2],
	},
});
