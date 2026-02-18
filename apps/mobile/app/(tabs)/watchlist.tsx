import { View, Text, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Bookmark } from "lucide-react-native";
import { useRouter } from "expo-router";
import { trpc } from "@/lib/trpc";
import { MovieGrid } from "@/components/movie-grid";
import { EmptyState } from "@/components/empty-state";
import { Colors, fontSize, fontFamily, spacing } from "@/lib/constants";
import { offsetPageParam } from "@/lib/pagination";

const PAGE_SIZE = 30;

export default function WatchlistScreen() {
	const router = useRouter();
	const { data, fetchNextPage, hasNextPage, refetch, isRefetching } =
		trpc.watchlist.getMyWatchlist.useInfiniteQuery(
			{ limit: PAGE_SIZE },
			{
				getNextPageParam: offsetPageParam(PAGE_SIZE),
			},
		);

	const movies = data?.pages.flat() ?? [];

	return (
		<SafeAreaView style={styles.container} edges={["top"]}>
			<Text style={styles.title}>Watchlist</Text>
			<MovieGrid
				movies={movies}
				hasNextPage={hasNextPage}
				fetchNextPage={fetchNextPage}
				onRefresh={refetch}
				isRefetching={isRefetching}
				ListEmptyComponent={
					<EmptyState
						icon={Bookmark}
						title="Your watchlist is empty"
						description="Movies you want to watch will appear here."
						actionLabel="Browse movies"
						onAction={() => router.push("/(tabs)/discover")}
					/>
				}
			/>
		</SafeAreaView>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: Colors.background,
	},
	title: {
		fontSize: fontSize["2xl"],
		fontFamily: fontFamily.displayBold,
		color: Colors.foreground,
		paddingHorizontal: spacing[4],
		paddingTop: spacing[2],
		paddingBottom: spacing[3],
	},
});
