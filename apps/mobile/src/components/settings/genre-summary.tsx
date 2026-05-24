import { View, Text, Pressable, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { ChevronRight } from "lucide-react-native";
import { trpc } from "@/lib/trpc";
import { fontSize, fontFamily, spacing, radius } from "@/lib/constants";
import {
	useThemedStyles,
	useTheme,
	colorWithAlpha,
	type ThemeColors,
} from "@/lib/theme";

export function GenreSummary() {
	const styles = useThemedStyles(createStyles);
	const { colors } = useTheme();
	const router = useRouter();
	const { data: genres } = trpc.movie.getGenres.useQuery();
	const { data: state } = trpc.onboarding.getState.useQuery();

	const selectedGenres =
		genres?.filter((g) => state?.genreIds.includes(g.id)) ?? [];

	return (
		<Pressable
			style={({ pressed }) => [styles.summaryRow, pressed && styles.pressed]}
			onPress={() => router.push("/settings-genres")}
		>
			<View style={styles.summaryContent}>
				{selectedGenres.length > 0 ? (
					<View style={styles.chipPreview}>
						{selectedGenres.slice(0, 4).map((g) => (
							<View key={g.id} style={styles.chipSmall}>
								<Text style={styles.chipSmallText}>{g.name}</Text>
							</View>
						))}
						{selectedGenres.length > 4 && (
							<Text style={styles.moreText}>
								+{selectedGenres.length - 4} more
							</Text>
						)}
					</View>
				) : (
					<Text style={styles.placeholderText}>No genres selected</Text>
				)}
			</View>
			<ChevronRight size={18} color={colors.mutedForeground} />
		</Pressable>
	);
}

const createStyles = (colors: ThemeColors) =>
	StyleSheet.create({
		summaryRow: {
			flexDirection: "row",
			alignItems: "center",
			justifyContent: "space-between",
			gap: spacing[3],
		},
		summaryContent: {
			flex: 1,
		},
		pressed: {
			opacity: 0.7,
		},
		placeholderText: {
			fontSize: fontSize.sm,
			fontFamily: fontFamily.sans,
			color: colors.mutedForeground,
		},
		moreText: {
			fontSize: fontSize.xs,
			fontFamily: fontFamily.sansMedium,
			color: colors.mutedForeground,
			alignSelf: "center",
		},
		chipPreview: {
			flexDirection: "row",
			flexWrap: "wrap",
			gap: spacing[2],
			alignItems: "center",
		},
		chipSmall: {
			paddingHorizontal: spacing[2],
			paddingVertical: spacing[1],
			borderRadius: radius.full,
			backgroundColor: colorWithAlpha(colors.primary, "20"),
		},
		chipSmallText: {
			fontSize: fontSize.xs,
			fontFamily: fontFamily.sansMedium,
			color: colors.primary,
		},
	});
