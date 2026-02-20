import { useLocalSearchParams, useNavigation } from "expo-router";
import { useLayoutEffect } from "react";
import { Search } from "lucide-react-native";
import { trpc } from "@/lib/trpc";
import { MovieGrid } from "@/components/movie-grid";
import { EmptyState } from "@/components/empty-state";

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

	const movies = data?.pages.flatMap((p) => p.results) ?? [];

	return (
		<MovieGrid
			movies={movies}
			isLoading={isLoading}
			hasNextPage={hasNextPage}
			fetchNextPage={fetchNextPage}
			isFetchingNextPage={isFetchingNextPage}
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
