import { View, StyleSheet } from "react-native";
import { spacing, radius } from "@/lib/constants";
import { useThemedStyles, type ThemeColors } from "@/lib/theme";

interface ProgressBarProps {
	currentStep: number;
	totalSteps: number;
}

export function ProgressBar({ currentStep, totalSteps }: ProgressBarProps) {
	const styles = useThemedStyles(createStyles);
	return (
		<View style={styles.container}>
			{Array.from({ length: totalSteps }, (_, i) => (
				<View
					key={i}
					style={[
						styles.segment,
						i < currentStep ? styles.filled : styles.unfilled,
					]}
				/>
			))}
		</View>
	);
}

const createStyles = (colors: ThemeColors) =>
	StyleSheet.create({
		container: {
			flexDirection: "row",
			gap: spacing[1.5],
			paddingHorizontal: spacing[4],
		},
		segment: {
			flex: 1,
			height: 4,
			borderRadius: radius.full,
		},
		filled: {
			backgroundColor: colors.primary,
		},
		unfilled: {
			backgroundColor: colors.muted,
		},
	});
