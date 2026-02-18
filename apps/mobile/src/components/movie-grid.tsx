import {
	FlatList,
	StyleSheet,
	View,
	RefreshControl,
	ActivityIndicator,
} from "react-native";
import { MoviePoster } from "./movie-poster";
import { Colors, spacing } from "@/lib/constants";
import type { MovieSummary } from "@/lib/types";

interface MovieGridProps {
	movies: MovieSummary[];
	isLoading?: boolean;
	hasNextPage?: boolean;
	fetchNextPage?: () => void;
	isFetchingNextPage?: boolean;
	onRefresh?: () => void;
	isRefetching?: boolean;
	ListEmptyComponent?: React.ReactElement;
	ListHeaderComponent?: React.ReactElement;
}

const NUM_COLUMNS = 3;
const ITEM_GAP = spacing[2];

export function MovieGrid({
	movies,
	isLoading,
	hasNextPage,
	fetchNextPage,
	isFetchingNextPage,
	onRefresh,
	isRefetching,
	ListEmptyComponent,
	ListHeaderComponent,
}: MovieGridProps) {
	function handleEndReached() {
		if (fetchNextPage && hasNextPage && !isFetchingNextPage) {
			fetchNextPage();
		}
	}

	return (
		<FlatList
			data={movies}
			keyExtractor={(item) => String(item.id)}
			numColumns={NUM_COLUMNS}
			contentContainerStyle={styles.list}
			columnWrapperStyle={styles.row}
			showsVerticalScrollIndicator={false}
			onEndReached={handleEndReached}
			onEndReachedThreshold={0.5}
			ListEmptyComponent={
				isLoading ? (
					<View style={styles.loadingContainer}>
						<ActivityIndicator color={Colors.primary} size="large" />
					</View>
				) : (
					ListEmptyComponent
				)
			}
			ListHeaderComponent={ListHeaderComponent}
			ListFooterComponent={
				isFetchingNextPage ? (
					<View style={styles.footer}>
						<ActivityIndicator color={Colors.mutedForeground} />
					</View>
				) : null
			}
			refreshControl={
				onRefresh ? (
					<RefreshControl
						refreshing={isRefetching ?? false}
						onRefresh={onRefresh}
						tintColor={Colors.mutedForeground}
					/>
				) : undefined
			}
			renderItem={({ item }) => (
				<View style={styles.item}>
					<MoviePoster
						id={item.id}
						posterPath={item.posterPath}
						title={item.title}
						width="100%"
						height={170}
					/>
				</View>
			)}
		/>
	);
}

const styles = StyleSheet.create({
	list: {
		paddingHorizontal: spacing[4],
		paddingBottom: spacing[8],
		flexGrow: 1,
	},
	row: {
		gap: ITEM_GAP,
	},
	item: {
		flex: 1,
		marginBottom: ITEM_GAP,
	},
	loadingContainer: {
		paddingVertical: spacing[12],
		alignItems: "center",
	},
	footer: {
		paddingVertical: spacing[4],
		alignItems: "center",
	},
});
