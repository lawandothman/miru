import { useCallback, useState } from "react";
import { RefreshControl, StyleSheet, View } from "react-native";
import { FlashList, type ListRenderItem } from "@shopify/flash-list";
import { MoviePoster } from "./movie-poster";
import { MovieGridSkeleton } from "./movie-grid-skeleton";
import { Spinner } from "./spinner";
import { spacing } from "@/lib/constants";
import { triggerRefreshHaptic } from "@/lib/haptics";
import { useTheme, useThemedStyles, type ThemeColors } from "@/lib/theme";
import type { MovieSummary } from "@/lib/types";

interface MovieGridProps {
	movies: MovieSummary[];
	isLoading?: boolean;
	hasNextPage?: boolean;
	fetchNextPage?: () => void;
	isFetchingNextPage?: boolean;
	onRefresh?: () => void;
	ListEmptyComponent?: React.ReactElement;
	ListHeaderComponent?: React.ReactElement;
}

const NUM_COLUMNS = 3;
const ITEM_GAP = spacing[2];
const HALF_GAP = ITEM_GAP / 2;

const keyExtractor = (item: MovieSummary) => String(item.id);

const renderItem: ListRenderItem<MovieSummary> = ({ item }) => (
	<GridItem item={item} />
);

function GridItem({ item }: { item: MovieSummary }) {
	const styles = useThemedStyles(createStyles);
	return (
		<View style={styles.item}>
			<MoviePoster
				id={item.id}
				posterPath={item.posterPath}
				title={item.title}
				width="100%"
				aspectRatio={2 / 3}
			/>
		</View>
	);
}

export function MovieGrid({
	movies,
	isLoading,
	hasNextPage,
	fetchNextPage,
	isFetchingNextPage,
	onRefresh,
	ListEmptyComponent,
	ListHeaderComponent,
}: MovieGridProps) {
	const styles = useThemedStyles(createStyles);
	const { colors } = useTheme();
	const [refreshing, setRefreshing] = useState(false);

	const handleEndReached = useCallback(() => {
		if (fetchNextPage && hasNextPage && !isFetchingNextPage) {
			fetchNextPage();
		}
	}, [fetchNextPage, hasNextPage, isFetchingNextPage]);

	const handleRefresh = useCallback(async () => {
		if (!onRefresh) {
			return;
		}

		triggerRefreshHaptic();
		setRefreshing(true);
		try {
			await onRefresh();
		} finally {
			setRefreshing(false);
		}
	}, [onRefresh]);

	return (
		<FlashList
			data={movies}
			keyExtractor={keyExtractor}
			renderItem={renderItem}
			numColumns={NUM_COLUMNS}
			contentContainerStyle={styles.list}
			contentInsetAdjustmentBehavior="automatic"
			showsVerticalScrollIndicator={false}
			alwaysBounceVertical={movies.length > 0}
			onEndReached={handleEndReached}
			onEndReachedThreshold={0.5}
			ListEmptyComponent={
				isLoading ? <MovieGridSkeleton /> : ListEmptyComponent
			}
			ListHeaderComponent={ListHeaderComponent}
			ListFooterComponent={
				isFetchingNextPage ? (
					<View style={styles.footer}>
						<Spinner />
					</View>
				) : null
			}
			refreshControl={
				onRefresh ? (
					<RefreshControl
						refreshing={refreshing}
						onRefresh={handleRefresh}
						tintColor={colors.mutedForeground}
					/>
				) : undefined
			}
		/>
	);
}

const createStyles = (_colors: ThemeColors) =>
	StyleSheet.create({
		list: {
			paddingHorizontal: spacing[4] - HALF_GAP,
			paddingBottom: spacing[8],
		},
		item: {
			flex: 1,
			padding: HALF_GAP,
		},
		footer: {
			paddingVertical: spacing[4],
			alignItems: "center",
		},
	});
