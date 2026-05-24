import { View, Text, Pressable, StyleSheet } from "react-native";
import type { LucideIcon } from "lucide-react-native";
import { fontSize, fontFamily, spacing, radius } from "@/lib/constants";
import { useTheme, useThemedStyles, type ThemeColors } from "@/lib/theme";

interface EmptyStateProps {
	icon: LucideIcon;
	title: string;
	description: string;
	actionLabel?: string;
	onAction?: () => void;
}

export function EmptyState({
	icon: Icon,
	title,
	description,
	actionLabel,
	onAction,
}: EmptyStateProps) {
	const styles = useThemedStyles(createStyles);
	const { colors } = useTheme();

	return (
		<View style={styles.container}>
			<Icon size={48} color={colors.mutedForeground} />
			<Text style={styles.title}>{title}</Text>
			<Text style={styles.description}>{description}</Text>
			{actionLabel && onAction && (
				<Pressable
					style={({ pressed }) => [styles.button, pressed && styles.pressed]}
					onPress={onAction}
					accessibilityRole="button"
					accessibilityLabel={actionLabel}
				>
					<Text style={styles.buttonText}>{actionLabel}</Text>
				</Pressable>
			)}
		</View>
	);
}

const createStyles = (colors: ThemeColors) =>
	StyleSheet.create({
		container: {
			flex: 1,
			justifyContent: "center",
			alignItems: "center",
			paddingHorizontal: spacing[8],
			gap: spacing[3],
		},
		title: {
			fontSize: fontSize.xl,
			fontFamily: fontFamily.sansSemibold,
			color: colors.foreground,
			marginTop: spacing[2],
		},
		description: {
			fontSize: fontSize.sm,
			color: colors.mutedForeground,
			textAlign: "center",
			lineHeight: 20,
		},
		button: {
			marginTop: spacing[4],
			backgroundColor: colors.primary,
			paddingHorizontal: spacing[6],
			paddingVertical: spacing[3],
			borderRadius: radius.lg,
		},
		pressed: {
			opacity: 0.8,
		},
		buttonText: {
			color: colors.primaryForeground,
			fontSize: fontSize.sm,
			fontFamily: fontFamily.sansSemibold,
		},
	});
