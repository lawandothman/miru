import { StyleSheet } from "react-native";
import { useLocalSearchParams, Stack } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { trpc } from "@/lib/trpc";
import { MovieGrid } from "@/components/movie-grid";
import { MovieGridSkeleton } from "@/components/movie-grid-skeleton";
import { useDefaultHeaderOptions } from "@/lib/navigation";
import { offsetPageParam } from "@/lib/pagination";
import { useThemedStyles, type ThemeColors } from "@/lib/theme";

const PAGE_SIZE = 30;

export default function GenreScreen() {
	const { id, name } = useLocalSearchParams<{ id: string; name?: string }>();
	const genreId = Number(id);
	const headerOptions = useDefaultHeaderOptions();
	const styles = useThemedStyles(createStyles);

	const { data: genre } = trpc.movie.getGenreById.useQuery(
		{ id: genreId },
		{ enabled: !Number.isNaN(genreId) && !name },
	);

	const title = name ?? genre?.name ?? "";

	const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } =
		trpc.movie.getByGenre.useInfiniteQuery(
			{ genreId, limit: PAGE_SIZE },
			{
				enabled: !Number.isNaN(genreId),
				getNextPageParam: offsetPageParam(PAGE_SIZE),
			},
		);

	const movies = data?.pages.flat() ?? [];

	return (
		<>
			<Stack.Screen
				options={{
					...headerOptions,
					title,
				}}
			/>
			<SafeAreaView style={styles.container} edges={[]}>
				{isLoading ? (
					<MovieGridSkeleton />
				) : (
					<MovieGrid
						movies={movies}
						hasNextPage={hasNextPage}
						fetchNextPage={fetchNextPage}
						isFetchingNextPage={isFetchingNextPage}
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
	});
