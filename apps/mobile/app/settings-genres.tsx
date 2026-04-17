import {
	View,
	Text,
	Pressable,
	ScrollView,
	Alert,
	StyleSheet,
} from "react-native";
import { Stack, useRouter } from "expo-router";
import { Spinner } from "@/components/spinner";
import { trpc } from "@/lib/trpc";
import { useToggleSet } from "@/hooks/use-toggle-set";
import { useDefaultHeaderOptions } from "@/lib/navigation";
import { Colors, fontSize, fontFamily, spacing, radius } from "@/lib/constants";

export default function SettingsGenresScreen() {
	const router = useRouter();
	const utils = trpc.useUtils();
	const headerOptions = useDefaultHeaderOptions();
	const { data: genres, isLoading: genresLoading } =
		trpc.movie.getGenres.useQuery();
	const { data: state, isLoading: stateLoading } =
		trpc.onboarding.getState.useQuery();

	const { selected, toggle, hasChanged } = useToggleSet(state?.genreIds);

	const setPrefs = trpc.onboarding.setGenrePreferences.useMutation({
		onSuccess: () => {
			utils.onboarding.getState.invalidate();
			router.back();
		},
		onError: () => Alert.alert("Error", "Failed to save preferences"),
	});

	const isLoading = genresLoading || stateLoading;
	const hasChanges = hasChanged(state?.genreIds);

	return (
		<>
			<Stack.Screen
				options={{
					...headerOptions,
					title: "Genre Preferences",
				}}
			/>
			<Stack.Toolbar placement="right">
				<Stack.Toolbar.Button
					icon="checkmark"
					variant="done"
					hidden={!hasChanges || setPrefs.isPending || selected.size === 0}
					onPress={() => setPrefs.mutate({ genreIds: Array.from(selected) })}
				/>
			</Stack.Toolbar>
			<ScrollView
				style={styles.container}
				contentContainerStyle={styles.content}
				showsVerticalScrollIndicator={false}
			>
				<Text style={styles.description}>
					Select genres you enjoy. This helps us recommend movies you&apos;ll
					love.
				</Text>

				{isLoading ? (
					<View style={styles.loadingContainer}>
						<Spinner size={32} color={Colors.primary} />
					</View>
				) : (
					<View style={styles.grid}>
						{genres?.map((g) => {
							const isSelected = selected.has(g.id);
							return (
								<Pressable
									key={g.id}
									style={[styles.chip, isSelected && styles.chipSelected]}
									onPress={() => toggle(g.id)}
								>
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
		</>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: Colors.background,
	},
	content: {
		padding: spacing[4],
		paddingTop: spacing[6],
		paddingBottom: spacing[12],
		gap: spacing[6],
	},
	description: {
		fontSize: fontSize.sm,
		fontFamily: fontFamily.sans,
		color: Colors.mutedForeground,
		lineHeight: 20,
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
