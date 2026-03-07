import { RefreshControl, ScrollView, StyleSheet, View } from "react-native";
import { useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { CarouselSkeleton } from "@/components/carousel-skeleton";
import { MovieCarousel } from "@/components/movie-carousel";
import { SearchBar } from "@/components/search-bar";
import { Colors, spacing } from "@/lib/constants";
import { triggerRefreshHaptic } from "@/lib/haptics";
import { trpc } from "@/lib/trpc";

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: Colors.background,
	},
	scroll: {
		paddingTop: spacing[4],
		paddingBottom: spacing[8],
		gap: spacing[6],
	},
	skeletons: {
		gap: spacing[6],
	},
});

export default function DiscoverScreen() {
	const [refreshing, setRefreshing] = useState(false);
	const {
		data: sections,
		isLoading,
		refetch,
	} = trpc.movie.getDiscoverSections.useQuery();

	async function handleRefresh() {
		triggerRefreshHaptic();
		setRefreshing(true);
		try {
			await refetch();
		} finally {
			setRefreshing(false);
		}
	}

	return (
		<SafeAreaView style={styles.container} edges={["top"]}>
			<ScrollView
				contentContainerStyle={styles.scroll}
				keyboardShouldPersistTaps="handled"
				refreshControl={
					<RefreshControl
						refreshing={refreshing}
						onRefresh={handleRefresh}
						tintColor={Colors.mutedForeground}
					/>
				}
			>
				<SearchBar />

				{isLoading && (
					<View style={styles.skeletons}>
						<CarouselSkeleton />
						<CarouselSkeleton />
						<CarouselSkeleton />
					</View>
				)}

				{!isLoading && sections && (
					<>
						<MovieCarousel title="Trending" movies={sections.trending} />
						<MovieCarousel title="New Releases" movies={sections.newReleases} />
						<MovieCarousel
							title="Popular on Miru"
							movies={sections.popularOnMiru}
						/>
						<MovieCarousel
							title="Friends Watching"
							movies={sections.friendsWatching}
						/>
					</>
				)}
			</ScrollView>
		</SafeAreaView>
	);
}
