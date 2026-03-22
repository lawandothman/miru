import { useState, useEffect, useRef } from "react";
import {
	View,
	Text,
	TextInput,
	Pressable,
	ScrollView,
	StyleSheet,
	Keyboard,
} from "react-native";
import { Image } from "expo-image";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Search, X } from "lucide-react-native";
import { trpc } from "@/lib/trpc";
import { capture } from "@/lib/analytics";
import { MovieGrid } from "@/components/movie-grid";
import { EmptyState } from "@/components/empty-state";
import { UserAvatar } from "@/components/user-avatar";
import { FollowButton } from "@/components/follow-button";
import {
	Colors,
	posterUrl,
	fontSize,
	fontFamily,
	spacing,
	radius,
} from "@/lib/constants";

function useDebounce(value: string, delay: number) {
	const [debounced, setDebounced] = useState(value);

	useEffect(() => {
		const timer = setTimeout(() => setDebounced(value), delay);
		return () => clearTimeout(timer);
	}, [value, delay]);

	return debounced;
}

export default function SearchScreen() {
	const [query, setQuery] = useState("");
	const [submittedQuery, setSubmittedQuery] = useState("");
	const inputRef = useRef<TextInput>(null);
	const router = useRouter();
	const insets = useSafeAreaInsets();
	const debouncedQuery = useDebounce(query, 300);

	useEffect(() => {
		const timer = setTimeout(() => inputRef.current?.focus(), 100);
		return () => clearTimeout(timer);
	}, []);

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

	const showAutocomplete =
		submittedQuery.length === 0 &&
		debouncedQuery.length > 0 &&
		autocompleteResults &&
		autocompleteResults.length > 0;

	const showFullResults = submittedQuery.length > 0;

	function handleSubmit() {
		const trimmed = query.trim();
		if (trimmed.length > 0) {
			capture("search_performed", { query: trimmed });
			setSubmittedQuery(trimmed);
			Keyboard.dismiss();
		}
	}

	function handleChangeText(text: string) {
		setQuery(text);
		if (submittedQuery.length > 0) {
			setSubmittedQuery("");
		}
	}

	function handleClear() {
		setQuery("");
		setSubmittedQuery("");
		inputRef.current?.focus();
	}

	function handleSelect(id: number) {
		router.push(`/movie/${id}`);
	}

	return (
		<View style={[styles.screen, { paddingTop: insets.top }]}>
			<View style={styles.header}>
				<View style={styles.inputContainer}>
					<Search size={18} color={Colors.mutedForeground} />
					<TextInput
						ref={inputRef}
						style={styles.input}
						placeholder="Search movies & people..."
						placeholderTextColor={Colors.mutedForeground}
						value={query}
						onChangeText={handleChangeText}
						returnKeyType="search"
						onSubmitEditing={handleSubmit}
						autoCorrect={false}
					/>
					{query.length > 0 && (
						<Pressable onPress={handleClear} hitSlop={8}>
							<X size={18} color={Colors.mutedForeground} />
						</Pressable>
					)}
				</View>
				<Pressable onPress={() => router.back()} hitSlop={8}>
					<Text style={styles.cancelText}>Cancel</Text>
				</Pressable>
			</View>

			{showAutocomplete && (
				<ScrollView
					style={styles.results}
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
								<View style={[styles.resultPoster, styles.posterPlaceholder]} />
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
						users.data && users.data.length > 0 ? (
							<PeopleSection people={users.data} />
						) : undefined
					}
					ListEmptyComponent={
						<EmptyState
							icon={Search}
							title="No results"
							description="Try a different search term."
						/>
					}
				/>
			)}
		</View>
	);
}

interface UserResult {
	id: string;
	name: string | null;
	image: string | null;
	isFollowing: boolean;
}

function PeopleSection({ people }: { people: UserResult[] }) {
	const router = useRouter();

	return (
		<View style={styles.section}>
			<Text style={styles.sectionTitle}>People</Text>
			{people.map((user) => (
				<Pressable
					key={user.id}
					style={({ pressed }) => [
						styles.userRow,
						pressed && styles.userRowPressed,
					]}
					onPress={() => router.push(`/user/${user.id}`)}
				>
					<View style={styles.userInfo}>
						<UserAvatar imageUrl={user.image} name={user.name} size={40} />
						<Text style={styles.userName} numberOfLines={1}>
							{user.name ?? "Unknown"}
						</Text>
					</View>
					<FollowButton userId={user.id} isFollowing={user.isFollowing} />
				</Pressable>
			))}
		</View>
	);
}

const styles = StyleSheet.create({
	screen: {
		flex: 1,
		backgroundColor: Colors.background,
	},
	header: {
		flexDirection: "row",
		alignItems: "center",
		paddingHorizontal: spacing[4],
		paddingVertical: spacing[2],
		gap: spacing[3],
	},
	inputContainer: {
		flex: 1,
		flexDirection: "row",
		alignItems: "center",
		backgroundColor: Colors.secondary,
		borderRadius: radius.lg,
		paddingHorizontal: spacing[3],
		height: 40,
		gap: spacing[2],
	},
	input: {
		flex: 1,
		color: Colors.foreground,
		fontSize: fontSize.base,
		fontFamily: fontFamily.sans,
	},
	cancelText: {
		color: Colors.primary,
		fontSize: fontSize.base,
		fontFamily: fontFamily.sansMedium,
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
		backgroundColor: Colors.accent,
	},
	resultPoster: {
		width: 40,
		height: 60,
		borderRadius: radius.sm,
	},
	posterPlaceholder: {
		backgroundColor: Colors.secondary,
	},
	resultInfo: {
		flex: 1,
		gap: 2,
	},
	resultTitle: {
		color: Colors.foreground,
		fontSize: fontSize.base,
		fontFamily: fontFamily.sansMedium,
	},
	resultYear: {
		color: Colors.mutedForeground,
		fontSize: fontSize.sm,
	},
	section: {
		marginBottom: spacing[4],
	},
	sectionTitle: {
		color: Colors.foreground,
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
		color: Colors.foreground,
		fontSize: fontSize.base,
		fontFamily: fontFamily.sansMedium,
		flex: 1,
	},
});
