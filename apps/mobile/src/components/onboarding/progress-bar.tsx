import { View, StyleSheet } from "react-native";
import { Colors, spacing, radius } from "@/lib/constants";

const TOTAL_STEPS = 5;

interface ProgressBarProps {
	currentStep: number;
}

export function ProgressBar({ currentStep }: ProgressBarProps) {
	return (
		<View style={styles.container}>
			{Array.from({ length: TOTAL_STEPS }, (_, i) => (
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
