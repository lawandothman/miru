import { useCallback, useMemo } from "react";
import { View } from "react-native";
import { FlashList, type ListRenderItem } from "@shopify/flash-list";
import { MoviePoster } from "./movie-poster";
import { spacing } from "@/lib/constants";
import type { MovieSummary } from "@/lib/types";

interface HorizontalMovieListProps {
	movies: MovieSummary[];
	posterWidth?: number;
	posterHeight?: number;
	gap?: number;
	contentPaddingHorizontal?: number;
}

const keyExtractor = (item: MovieSummary) => String(item.id);

export function HorizontalMovieList({
	movies,
	posterWidth = 120,
	posterHeight = 180,
	gap = spacing[3],
	contentPaddingHorizontal = spacing[4],
}: HorizontalMovieListProps) {
	const renderItem: ListRenderItem<MovieSummary> = useCallback(
		({ item }) => (
			<MoviePoster
				id={item.id}
				posterPath={item.posterPath}
				title={item.title}
				width={posterWidth}
				height={posterHeight}
				transition={0}
			/>
		),
		[posterWidth, posterHeight],
	);

	const ItemSeparator = useCallback(
		() => <View style={{ width: gap }} />,
		[gap],
	);

	const wrapperStyle = useMemo(
		() => ({ height: posterHeight }),
		[posterHeight],
	);
	const contentContainerStyle = useMemo(
		() => ({ paddingHorizontal: contentPaddingHorizontal }),
		[contentPaddingHorizontal],
	);

	return (
		<View style={wrapperStyle}>
			<FlashList
				data={movies}
				keyExtractor={keyExtractor}
				renderItem={renderItem}
				ItemSeparatorComponent={ItemSeparator}
				horizontal
				showsHorizontalScrollIndicator={false}
				contentContainerStyle={contentContainerStyle}
				decelerationRate="fast"
			/>
		</View>
	);
}
