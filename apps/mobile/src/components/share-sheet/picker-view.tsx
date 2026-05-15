import { FlatList, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { ChevronLeft, Search } from "lucide-react-native";
import { useState } from "react";
import { useDebounce } from "@/hooks/use-debounce";
import type { RecommendRecipient } from "@/hooks/use-recommendation-draft";
import { EmptyState } from "@/components/empty-state";
import { Spinner } from "@/components/spinner";
import { UserAvatar } from "@/components/user-avatar";
import { Colors, fontFamily, fontSize, radius, spacing } from "@/lib/constants";
import { trpc } from "@/lib/trpc";

interface PickerViewProps {
	movieId: number;
	onBack: () => void;
	onSelect: (recipient: RecommendRecipient) => void;
}

export function PickerView({ movieId, onBack, onSelect }: PickerViewProps) {
	const [query, setQuery] = useState("");
	const debouncedQuery = useDebounce(query, 200);

	const { data, isLoading } = trpc.recommendation.getRecipientCandidates.useQuery({
		movieId,
		query: debouncedQuery.trim() || undefined,
	});

	const candidates = data ?? [];

	return (
		<View style={styles.container}>
			<View style={styles.header}>
				<Pressable
					style={({ pressed }) => [styles.backBtn, pressed && styles.pressed]}
					onPress={onBack}
					accessibilityRole="button"
					accessibilityLabel="Back"
				>
					<ChevronLeft size={22} color={Colors.foreground} />
				</Pressable>
				<Text style={styles.title}>Send to a friend</Text>
				<View style={styles.headerSpacer} />
			</View>

			<View style={styles.searchBar}>
				<Search size={18} color={Colors.mutedForeground} />
				<TextInput
					style={styles.searchInput}
					value={query}
					onChangeText={setQuery}
					placeholder="Search friends"
					placeholderTextColor={Colors.mutedForeground}
					autoCapitalize="none"
					autoCorrect={false}
				/>
			</View>

			{isLoading ? (
				<View style={styles.loading}>
					<Spinner />
				</View>
			) : candidates.length === 0 ? (
				<View style={styles.empty}>
					<EmptyState
						icon={Search}
						title={query.length > 0 ? "No matches" : "Follow someone first"}
						description={
							query.length > 0
								? "Try a different name."
								: "You can only recommend movies to people you follow."
						}
					/>
				</View>
			) : (
				<FlatList
					data={candidates}
					keyExtractor={(item) => item.id}
					contentContainerStyle={styles.list}
					keyboardShouldPersistTaps="handled"
					renderItem={({ item }) => {
						const status = item.hasPendingSend
							? "Already sent — waiting"
							: item.isWatched
								? "Already watched"
								: item.inWatchlist
									? "On their watchlist"
									: null;
						return (
							<Pressable
								style={({ pressed }) => [
									styles.row,
									pressed && styles.rowPressed,
									item.hasPendingSend && styles.rowDisabled,
								]}
								onPress={() =>
									onSelect({ id: item.id, name: item.name, image: item.image })
								}
								disabled={item.hasPendingSend}
								accessibilityRole="button"
								accessibilityLabel={`Send to ${item.name ?? "user"}`}
							>
								<UserAvatar imageUrl={item.image} name={item.name} size={44} />
								<View style={styles.rowText}>
									<Text style={styles.rowName} numberOfLines={1}>
										{item.name}
									</Text>
									{status ? (
										<Text style={styles.rowStatus} numberOfLines={1}>
											{status}
										</Text>
									) : null}
								</View>
							</Pressable>
						);
					}}
				/>
			)}
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		paddingTop: spacing[2],
		paddingBottom: spacing[4],
		gap: spacing[3],
		minHeight: 480,
		maxHeight: 640,
	},
	header: {
		flexDirection: "row",
		alignItems: "center",
		paddingHorizontal: spacing[4],
		gap: spacing[2],
	},
	backBtn: {
		width: 36,
		height: 36,
		borderRadius: 18,
		justifyContent: "center",
		alignItems: "center",
	},
	headerSpacer: {
		width: 36,
	},
	title: {
		flex: 1,
		fontSize: fontSize.lg,
		fontFamily: fontFamily.displaySemibold,
		color: Colors.foreground,
		textAlign: "center",
	},
	searchBar: {
		flexDirection: "row",
		alignItems: "center",
		gap: spacing[2],
		marginHorizontal: spacing[4],
		paddingHorizontal: spacing[3],
		paddingVertical: spacing[2],
		backgroundColor: Colors.card,
		borderRadius: radius.lg,
		borderWidth: 1,
		borderColor: Colors.border,
	},
	searchInput: {
		flex: 1,
		fontSize: fontSize.base,
		fontFamily: fontFamily.sans,
		color: Colors.foreground,
		paddingVertical: spacing[1],
	},
	list: {
		paddingHorizontal: spacing[4],
		paddingTop: spacing[1],
		paddingBottom: spacing[4],
		gap: spacing[1],
	},
	row: {
		flexDirection: "row",
		alignItems: "center",
		gap: spacing[3],
		paddingVertical: spacing[2],
	},
	rowPressed: {
		opacity: 0.7,
	},
	rowDisabled: {
		opacity: 0.4,
	},
	rowText: {
		flex: 1,
		gap: 2,
	},
	rowName: {
		fontSize: fontSize.base,
		fontFamily: fontFamily.sansMedium,
		color: Colors.foreground,
	},
	rowStatus: {
		fontSize: fontSize.xs,
		fontFamily: fontFamily.sans,
		color: Colors.mutedForeground,
	},
	loading: {
		paddingVertical: spacing[8],
		alignItems: "center",
	},
	empty: {
		paddingTop: spacing[6],
		paddingBottom: spacing[8],
		minHeight: 280,
	},
	pressed: {
		opacity: 0.6,
	},
});
