import { useState, useRef, useCallback } from "react";
import {
	View,
	Text,
	Platform,
	Pressable,
	ScrollView,
	StyleSheet,
	TextInput,
	type NativeSyntheticEvent,
	type TextInputFocusEventData,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Image } from "expo-image";
import { useRouter, Stack, useFocusEffect } from "expo-router";
import type { SearchBarCommands } from "react-native-screens";
import { Search } from "lucide-react-native";
import { useTheme } from "@/lib/theme";
import { trpc } from "@/lib/trpc";
import { useDebounce } from "@/hooks/use-debounce";
import { capture } from "@/lib/analytics";
import { MovieGrid } from "@/components/movie-grid";
import { EmptyState } from "@/components/empty-state";
import { PeopleSection } from "@/components/search/people-section";
import {
	posterUrl,
	fontSize,
	fontFamily,
	spacing,
	radius,
} from "@/lib/constants";
import { useThemedStyles, type ThemeColors } from "@/lib/theme";

export default function SearchScreen() {
	const [query, setQuery] = useState("");
	const [submittedQuery, setSubmittedQuery] = useState("");
	const searchBarRef = useRef<SearchBarCommands>(null);
	const androidInputRef = useRef<TextInput>(null);
	const router = useRouter();
	const styles = useThemedStyles(createStyles);
	const { colors } = useTheme();
	const insets = useSafeAreaInsets();

	useFocusEffect(
		useCallback(() => {
			const id = setImmediate(() => {
				if (Platform.OS === "ios") {
					searchBarRef.current?.focus();
				} else {
					androidInputRef.current?.focus();
				}
			});
			return () => clearImmediate(id);
		}, []),
	);

	function handleAndroidChangeText(text: string) {
		setQuery(text);
		if (submittedQuery.length > 0) {
			setSubmittedQuery("");
		}
	}

	function handleAndroidSubmit() {
		const trimmed = query.trim();
		if (trimmed.length > 0) {
			capture("search_performed", { query: trimmed });
			setSubmittedQuery(trimmed);
		}
	}
	const debouncedQuery = useDebounce(query, 300);

	const { data: autocompleteResults } = trpc.movie.searchAutocomplete.useQuery(
		{ query: debouncedQuery },
		{ enabled: debouncedQuery.length > 0 && submittedQuery.length === 0 },
	);

	const fullSearch = trpc.movie.search.useInfiniteQuery(
		{ query: submittedQuery },
		{
			enabled: submittedQuery.length > 0,
			getNextPageParam: (lastPage) =>
				lastPage.page < lastPage.totalPages ? lastPage.page + 1 : undefined,
		},
	);

	const users = trpc.social.searchUsers.useQuery(
		{ query: submittedQuery },
		{ enabled: submittedQuery.length > 0 },
	);

	const movies = fullSearch.data?.pages.flatMap((p) => p.results) ?? [];
	const hasUsers = (users.data?.length ?? 0) > 0;

	const showAutocomplete =
		submittedQuery.length === 0 &&
		debouncedQuery.length > 0 &&
		autocompleteResults &&
		autocompleteResults.length > 0;

	const showFullResults = submittedQuery.length > 0;

	function handleChangeText(e: NativeSyntheticEvent<TextInputFocusEventData>) {
		const text = e.nativeEvent.text;
		setQuery(text);
		if (submittedQuery.length > 0) {
			setSubmittedQuery("");
		}
	}

	function handleSearchSubmit(
		e: NativeSyntheticEvent<TextInputFocusEventData>,
	) {
		const trimmed = e.nativeEvent.text.trim();
		if (trimmed.length > 0) {
			capture("search_performed", { query: trimmed });
			setSubmittedQuery(trimmed);
		}
	}

	function handleSelect(id: number) {
		router.push(`/movie/${id}`);
	}

	return (
		<>
			<Stack.Screen options={{ title: "Search" }} />
			{Platform.OS === "ios" ? (
				<Stack.SearchBar
					ref={searchBarRef}
					placement="automatic"
					placeholder="Search"
					onChangeText={handleChangeText}
					onSearchButtonPress={handleSearchSubmit}
				/>
			) : null}

			<View style={styles.screen}>
				{Platform.OS === "android" ? (
					<View
						style={[styles.androidSearchBar, { marginTop: insets.top }]}
					>
						<Search
							size={20}
							color={colors.mutedForeground}
							style={styles.androidSearchIcon}
						/>
						<TextInput
							ref={androidInputRef}
							value={query}
							onChangeText={handleAndroidChangeText}
							onSubmitEditing={handleAndroidSubmit}
							placeholder="Search"
							placeholderTextColor={colors.mutedForeground}
							returnKeyType="search"
							autoCorrect={false}
							style={styles.androidSearchInput}
						/>
					</View>
				) : null}
				{showAutocomplete && (
					<ScrollView
						style={styles.results}
						contentInsetAdjustmentBehavior="automatic"
						keyboardShouldPersistTaps="handled"
						keyboardDismissMode="on-drag"
					>
						{autocompleteResults.map((item) => (
							<Pressable
								key={item.id}
								style={({ pressed }) => [
									styles.resultItem,
									pressed && styles.resultItemPressed,
								]}
								onPress={() => handleSelect(item.id)}
							>
								{item.posterPath ? (
									<Image
										source={{ uri: posterUrl(item.posterPath) }}
										style={styles.resultPoster}
										contentFit="cover"
									/>
								) : (
									<View
										style={[styles.resultPoster, styles.posterPlaceholder]}
									/>
								)}
								<View style={styles.resultInfo}>
									<Text style={styles.resultTitle} numberOfLines={1}>
										{item.title}
									</Text>
									{item.releaseDate && (
										<Text style={styles.resultYear}>
											{item.releaseDate.slice(0, 4)}
										</Text>
									)}
								</View>
							</Pressable>
						))}
					</ScrollView>
				)}

				{showFullResults && (
					<MovieGrid
						movies={movies}
						isLoading={fullSearch.isLoading}
						hasNextPage={fullSearch.hasNextPage}
						fetchNextPage={fullSearch.fetchNextPage}
						isFetchingNextPage={fullSearch.isFetchingNextPage}
						ListHeaderComponent={
							<>
								{users.data && users.data.length > 0 && (
									<PeopleSection people={users.data} />
								)}
								{movies.length > 0 && (
									<Text style={styles.sectionTitle}>Movies</Text>
								)}
							</>
						}
						ListEmptyComponent={
							hasUsers ? undefined : (
								<EmptyState
									icon={Search}
									title="No results"
									description="Try a different search term."
								/>
							)
						}
					/>
				)}
			</View>
		</>
	);
}

const createStyles = (colors: ThemeColors) =>
	StyleSheet.create({
		screen: {
			flex: 1,
			backgroundColor: colors.background,
		},
		androidSearchBar: {
			flexDirection: "row",
			alignItems: "center",
			marginHorizontal: spacing[4],
			marginBottom: spacing[3],
			paddingHorizontal: spacing[3],
			height: 44,
			borderRadius: radius.lg,
			backgroundColor: colors.muted,
		},
		androidSearchIcon: {
			marginRight: spacing[2],
		},
		androidSearchInput: {
			flex: 1,
			fontSize: fontSize.base,
			fontFamily: fontFamily.sans,
			color: colors.foreground,
			height: "100%",
		},
		results: {
			flex: 1,
		},
		resultItem: {
			flexDirection: "row",
			alignItems: "center",
			paddingHorizontal: spacing[4],
			paddingVertical: spacing[2.5],
			gap: spacing[3],
		},
		resultItemPressed: {
			backgroundColor: colors.accent,
		},
		resultPoster: {
			width: 40,
			height: 60,
			borderRadius: radius.sm,
		},
		posterPlaceholder: {
			backgroundColor: colors.secondary,
		},
		resultInfo: {
			flex: 1,
			gap: 2,
		},
		resultTitle: {
			color: colors.foreground,
			fontSize: fontSize.base,
			fontFamily: fontFamily.sansMedium,
		},
		resultYear: {
			color: colors.mutedForeground,
			fontSize: fontSize.sm,
		},
		section: {
			marginBottom: spacing[4],
		},
		sectionTitle: {
			color: colors.foreground,
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
		userRowPressed: {
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
			color: colors.foreground,
			fontSize: fontSize.base,
			fontFamily: fontFamily.sansMedium,
			flex: 1,
		},
	});
