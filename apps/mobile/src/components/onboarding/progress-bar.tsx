import { View, StyleSheet } from "react-native";
import { Colors, spacing, radius } from "@/lib/constants";

interface ProgressBarProps {
	currentStep: number;
	totalSteps: number;
}

export function ProgressBar({ currentStep, totalSteps }: ProgressBarProps) {
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

const styles = StyleSheet.create({
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
		backgroundColor: Colors.primary,
	},
	unfilled: {
		backgroundColor: Colors.muted,
	},
});
