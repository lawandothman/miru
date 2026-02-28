import {
	View,
	Text,
	Pressable,
	ScrollView,
	ActivityIndicator,
	StyleSheet,
} from "react-native";
import { Check } from "lucide-react-native";
import { trpc } from "@/lib/trpc";
import { Colors, fontSize, fontFamily, spacing, radius } from "@/lib/constants";

interface GenreStepProps {
	selectedGenres: Set<number>;
	onSelectionChange: (genres: Set<number>) => void;
}

export function GenreStep({
	selectedGenres,
	onSelectionChange,
}: GenreStepProps) {
	const { data: genres, isLoading } = trpc.movie.getGenres.useQuery();

	function toggle(id: number) {
		const next = new Set(selectedGenres);
		if (next.has(id)) {
			next.delete(id);
		} else {
			next.add(id);
		}
		onSelectionChange(next);
	}

	return (
		<ScrollView
			style={styles.container}
			contentContainerStyle={styles.content}
			showsVerticalScrollIndicator={false}
		>
			<Text style={styles.title}>What do you like?</Text>
			<Text style={styles.subtitle}>
				Pick at least one genre so we can recommend movies you&apos;ll love.
			</Text>

			{isLoading ? (
				<View style={styles.loadingContainer}>
					<ActivityIndicator color={Colors.primary} size="large" />
				</View>
			) : (
				<View style={styles.grid}>
					{genres?.map((g) => {
						const isSelected = selectedGenres.has(g.id);
						return (
							<Pressable
								key={g.id}
								style={[styles.chip, isSelected && styles.chipSelected]}
								onPress={() => toggle(g.id)}
							>
								{isSelected && (
									<Check size={14} color={Colors.primaryForeground} />
								)}
								<Text
									style={[
										styles.chipText,
										isSelected && styles.chipTextSelected,
									]}
								>
									{g.name}
								</Text>
							</Pressable>
						);
					})}
				</View>
			)}
		</ScrollView>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
	},
	content: {
		padding: spacing[4],
		paddingBottom: spacing[8],
		gap: spacing[6],
	},
	title: {
		fontSize: fontSize["2xl"],
		fontFamily: fontFamily.displayBold,
		color: Colors.foreground,
	},
	subtitle: {
		fontSize: fontSize.base,
		fontFamily: fontFamily.sans,
		color: Colors.mutedForeground,
		lineHeight: 22,
	},
	loadingContainer: {
		paddingVertical: spacing[12],
		alignItems: "center",
	},
	grid: {
		flexDirection: "row",
		flexWrap: "wrap",
		gap: spacing[3],
	},
	chip: {
		flexDirection: "row",
		alignItems: "center",
		gap: spacing[2],
		paddingHorizontal: spacing[4],
		paddingVertical: spacing[3],
		borderRadius: radius.full,
		backgroundColor: Colors.card,
		borderWidth: 1,
		borderColor: Colors.border,
	},
	chipSelected: {
		backgroundColor: Colors.primary,
		borderColor: Colors.primary,
	},
	chipText: {
		fontSize: fontSize.sm,
		fontFamily: fontFamily.sansMedium,
		color: Colors.foreground,
	},
	chipTextSelected: {
		color: Colors.primaryForeground,
	},
});
