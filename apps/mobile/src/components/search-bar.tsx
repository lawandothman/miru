import { useState, useEffect, useRef } from "react";
import {
	View,
	TextInput,
	ScrollView,
	Text,
	Pressable,
	StyleSheet,
} from "react-native";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { Search, X } from "lucide-react-native";
import { trpc } from "@/lib/trpc";
import {
	Colors,
	posterUrl,
	fontSize,
	fontFamily,
	spacing,
	radius,
} from "@/lib/constants";

export function SearchBar() {
	const [query, setQuery] = useState("");
	const [focused, setFocused] = useState(false);
	const inputRef = useRef<TextInput>(null);
	const router = useRouter();

	const debounced = useDebounce(query, 300);

	const { data: results } = trpc.movie.searchAutocomplete.useQuery(
		{ query: debounced },
		{ enabled: debounced.length > 0 },
	);

	const showResults =
		focused && debounced.length > 0 && results && results.length > 0;

	function handleClear() {
		setQuery("");
		inputRef.current?.blur();
	}

	function handleSelect(id: number) {
		setQuery("");
		inputRef.current?.blur();
		router.push(`/movie/${id}`);
	}

	return (
		<View style={styles.container}>
			<View style={styles.inputContainer}>
				<Search size={18} color={Colors.mutedForeground} />
				<TextInput
					ref={inputRef}
					style={styles.input}
					placeholder="Search movies..."
					placeholderTextColor={Colors.mutedForeground}
					value={query}
					onChangeText={setQuery}
					onFocus={() => setFocused(true)}
					onBlur={() => setTimeout(() => setFocused(false), 200)}
					returnKeyType="search"
				/>
				{query.length > 0 && (
					<Pressable onPress={handleClear}>
						<X size={18} color={Colors.mutedForeground} />
					</Pressable>
				)}
			</View>

			{showResults && (
				<ScrollView
					style={styles.dropdown}
					keyboardShouldPersistTaps="handled"
					nestedScrollEnabled
				>
					{results.map((item) => (
						<Pressable
							key={item.id}
							style={({ pressed }) => [
								styles.resultItem,
								pressed && styles.pressed,
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
								<View style={styles.resultPoster} />
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
		</View>
	);
}

function useDebounce(value: string, delay: number) {
	const [debounced, setDebounced] = useState(value);

	useEffect(() => {
		const timer = setTimeout(() => setDebounced(value), delay);
		return () => clearTimeout(timer);
	}, [value, delay]);

	return debounced;
}

const styles = StyleSheet.create({
	container: {
		zIndex: 10,
		paddingHorizontal: spacing[4],
	},
	inputContainer: {
		flexDirection: "row",
		alignItems: "center",
		backgroundColor: Colors.secondary,
		borderRadius: radius.lg,
		paddingHorizontal: spacing[3],
		height: 44,
		gap: spacing[2],
	},
	input: {
		flex: 1,
		color: Colors.foreground,
		fontSize: fontSize.base,
		fontFamily: fontFamily.sans,
	},
	dropdown: {
		position: "absolute",
		top: 52,
		left: spacing[4],
		right: spacing[4],
		backgroundColor: Colors.card,
		borderRadius: radius.lg,
		borderWidth: 1,
		borderColor: Colors.border,
		maxHeight: 300,
		overflow: "hidden",
		zIndex: 20,
		elevation: 20,
	},
	resultItem: {
		flexDirection: "row",
		alignItems: "center",
		padding: spacing[3],
		gap: spacing[3],
	},
	pressed: {
		backgroundColor: Colors.accent,
	},
	resultPoster: {
		width: 36,
		height: 54,
		borderRadius: radius.sm,
		backgroundColor: Colors.secondary,
	},
	resultInfo: {
		flex: 1,
		gap: 2,
	},
	resultTitle: {
		color: Colors.foreground,
		fontSize: fontSize.sm,
		fontFamily: fontFamily.sansMedium,
	},
	resultYear: {
		color: Colors.mutedForeground,
		fontSize: fontSize.xs,
	},
});
