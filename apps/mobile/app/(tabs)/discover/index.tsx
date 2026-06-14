import {
	Platform,
	RefreshControl,
	ScrollView,
	StyleSheet,
	Text,
	TextInput,
	View,
} from "react-native";
import { useState } from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Search } from "lucide-react-native";
import { CarouselSkeleton } from "@/components/carousel-skeleton";
import { EmptyState } from "@/components/empty-state";
import { MovieCarousel } from "@/components/movie-carousel";
import { MovieGrid } from "@/components/movie-grid";
import { PeopleSection } from "@/components/search/people-section";
import { useDebounce } from "@/hooks/use-debounce";
import { fontFamily, fontSize, radius, spacing } from "@/lib/constants";
import { useTheme, useThemedStyles, type ThemeColors } from "@/lib/theme";
import { triggerRefreshHaptic } from "@/lib/haptics";
import { trpc } from "@/lib/trpc";

const createStyles = (colors: ThemeColors) =>
	StyleSheet.create({
		container: {
			flex: 1,
			backgroundColor: colors.background,
		},
		androidSearchBar: {
			marginHorizontal: spacing[4],
			marginTop: spacing[2],
			marginBottom: spacing[3],
			paddingHorizontal: spacing[4],
			height: 44,
			borderRadius: radius.lg,
			backgroundColor: colors.muted,
		},
		androidSearchInput: {
			flex: 1,
			fontSize: fontSize.base,
			fontFamily: fontFamily.sans,
			color: colors.foreground,
			height: "100%",
		},
		scroll: {
			paddingTop: spacing[4],
			gap: spacing[6],
		},
		skeletons: {
			gap: spacing[6],
		},
		resultsContainer: {
			flex: 1,
			paddingHorizontal: spacing[4],
		},
		sectionTitle: {
			color: colors.foreground,
			fontSize: fontSize.lg,
			fontFamily: fontFamily.displaySemibold,
			marginBottom: spacing[3],
		},
	});

export default function DiscoverScreen() {
	const [refreshing, setRefreshing] = useState(false);
	const [query, setQuery] = useState("");
	const { colors } = useTheme();
	const styles = useThemedStyles(createStyles);
	const insets = useSafeAreaInsets();

	const {
		data: sections,
		isLoading,
		refetch,
	} = trpc.movie.getDiscoverSections.useQuery();

	const debouncedQuery = useDebounce(query.trim(), 300);
	const isSearching = debouncedQuery.length > 0;

	const search = trpc.movie.search.useInfiniteQuery(
		{ query: debouncedQuery },
		{
			enabled: isSearching,
			getNextPageParam: (lastPage) =>
				lastPage.page < lastPage.totalPages ? lastPage.page + 1 : undefined,
		},
	);

	const users = trpc.social.searchUsers.useQuery(
		{ query: debouncedQuery },
		{ enabled: isSearching },
	);

	const searchResults = search.data?.pages.flatMap((p) => p.results) ?? [];
	const hasUsers = (users.data?.length ?? 0) > 0;

	async function handleRefresh() {
		triggerRefreshHaptic();
		setRefreshing(true);
		try {
			await refetch();
		} finally {
			setRefreshing(false);
		}
	}

	const androidSearchInput =
		Platform.OS === "android" ? (
			<View style={styles.androidSearchBar}>
				<TextInput
					value={query}
					onChangeText={setQuery}
					placeholder="Search"
					placeholderTextColor={colors.mutedForeground}
					returnKeyType="search"
					autoCorrect={false}
					autoCapitalize="none"
					style={styles.androidSearchInput}
				/>
			</View>
		) : null;

	if (Platform.OS === "android" && isSearching) {
		return (
			<View style={[styles.container, { paddingTop: insets.top }]}>
				{androidSearchInput}
				<View style={styles.resultsContainer}>
					<MovieGrid
						movies={searchResults}
						isLoading={search.isLoading}
						hasNextPage={search.hasNextPage}
						fetchNextPage={search.fetchNextPage}
						isFetchingNextPage={search.isFetchingNextPage}
						ListHeaderComponent={
							<>
								{hasUsers && users.data ? (
									<PeopleSection people={users.data} />
								) : null}
								{searchResults.length > 0 ? (
									<Text style={styles.sectionTitle}>Movies</Text>
								) : null}
							</>
						}
						ListEmptyComponent={
							search.isLoading || hasUsers ? undefined : (
								<EmptyState
									icon={Search}
									title="No results"
									description="Try a different search term."
								/>
							)
						}
					/>
				</View>
			</View>
		);
	}

	return (
		<View style={[styles.container, { paddingTop: insets.top }]}>
			{androidSearchInput}
			<ScrollView
				contentContainerStyle={[
					styles.scroll,
					{ paddingBottom: spacing[8] + insets.bottom },
				]}
				keyboardShouldPersistTaps="handled"
				directionalLockEnabled
				refreshControl={
					<RefreshControl
						refreshing={refreshing}
						onRefresh={handleRefresh}
						tintColor={colors.mutedForeground}
					/>
				}
			>
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
		</View>
	);
}
