import { View, Text, StyleSheet } from "react-native";
import { Colors, fontSize, fontFamily, spacing } from "@/lib/constants";

interface MovieOverviewProps {
	tagline: string | null | undefined;
	overview: string | null | undefined;
}

export function MovieOverview({ tagline, overview }: MovieOverviewProps) {
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

const styles = StyleSheet.create({
	overviewBlock: {
		gap: spacing[2],
	},
	tagline: {
		fontSize: fontSize.xs,
		fontFamily: fontFamily.sansSemibold,
		color: Colors.mutedForeground,
		textTransform: "uppercase",
		letterSpacing: 1,
	},
	overview: {
		fontSize: fontSize.sm,
		fontFamily: fontFamily.sans,
		color: Colors.mutedForeground,
		lineHeight: 22,
	},
});
