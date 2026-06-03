import { View, Text, StyleSheet } from "react-native";
import { fontSize, fontFamily, spacing } from "@/lib/constants";
import { useThemedStyles, type ThemeColors } from "@/lib/theme";

interface MovieOverviewProps {
	tagline: string | null | undefined;
	overview: string | null | undefined;
}

export function MovieOverview({ tagline, overview }: MovieOverviewProps) {
	const styles = useThemedStyles(createStyles);
	if (!tagline && !overview) {
		return null;
	}

	return (
		<View style={styles.overviewBlock}>
			{tagline ? <Text style={styles.tagline}>{tagline}</Text> : null}
			{overview ? <Text style={styles.overview}>{overview}</Text> : null}
		</View>
	);
}

const createStyles = (colors: ThemeColors) =>
	StyleSheet.create({
		overviewBlock: {
			gap: spacing[2],
		},
		tagline: {
			fontSize: fontSize.xs,
			fontFamily: fontFamily.sansSemibold,
			color: colors.mutedForeground,
			textTransform: "uppercase",
			letterSpacing: 1,
		},
		overview: {
			fontSize: fontSize.sm,
			fontFamily: fontFamily.sans,
			color: colors.mutedForeground,
			lineHeight: 22,
		},
	});
