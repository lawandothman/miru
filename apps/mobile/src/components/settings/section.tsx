import { View, Text, StyleSheet } from "react-native";
import { fontSize, fontFamily, spacing, radius } from "@/lib/constants";
import { useThemedStyles, useTheme, type ThemeColors } from "@/lib/theme";

interface SettingsSectionProps {
	title: string;
	icon?: React.ComponentType<{ size: number; color: string }>;
	children: React.ReactNode;
}

export function SettingsSection({
	title,
	icon: Icon,
	children,
}: SettingsSectionProps) {
	const styles = useThemedStyles(createStyles);
	const { colors } = useTheme();
	return (
		<View style={styles.section}>
			<View style={styles.sectionHeader}>
				{Icon && <Icon size={14} color={colors.mutedForeground} />}
				<Text style={styles.sectionTitle}>{title}</Text>
			</View>
			<View style={styles.sectionCard}>{children}</View>
		</View>
	);
}

const createStyles = (colors: ThemeColors) =>
	StyleSheet.create({
		section: {
			gap: spacing[2],
		},
		sectionHeader: {
			flexDirection: "row",
			alignItems: "center",
			gap: spacing[2],
			paddingHorizontal: spacing[1],
		},
		sectionTitle: {
			fontSize: fontSize.xs,
			fontFamily: fontFamily.displaySemibold,
			color: colors.mutedForeground,
			textTransform: "uppercase",
			letterSpacing: 1.5,
		},
		sectionCard: {
			backgroundColor: colors.card,
			borderRadius: radius.xl,
			padding: spacing[4],
		},
	});
