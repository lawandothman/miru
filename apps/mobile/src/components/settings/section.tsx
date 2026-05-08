import { View, Text, StyleSheet } from "react-native";
import { Colors, fontSize, fontFamily, spacing, radius } from "@/lib/constants";

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
	return (
		<View style={styles.section}>
			<View style={styles.sectionHeader}>
				{Icon && <Icon size={14} color={Colors.mutedForeground} />}
				<Text style={styles.sectionTitle}>{title}</Text>
			</View>
			<View style={styles.sectionCard}>{children}</View>
		</View>
	);
}

const styles = StyleSheet.create({
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
		color: Colors.mutedForeground,
		textTransform: "uppercase",
		letterSpacing: 1.5,
	},
	sectionCard: {
		backgroundColor: Colors.card,
		borderRadius: radius.xl,
		padding: spacing[4],
	},
});
