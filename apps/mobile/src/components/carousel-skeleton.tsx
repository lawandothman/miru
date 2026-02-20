import { View, StyleSheet } from "react-native";
import { Colors, spacing, radius } from "@/lib/constants";

const ITEM_COUNT = 4;
const ITEM_WIDTH = 120;
const ITEM_HEIGHT = 180;

export function CarouselSkeleton() {
	return (
		<View style={styles.container}>
			<View style={styles.titleBar} />
			<View style={styles.list}>
				{Array.from({ length: ITEM_COUNT }, (_, i) => (
					<View key={i} style={styles.item} />
				))}
			</View>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		gap: spacing[3],
	},
	titleBar: {
		width: 120,
		height: 18,
		borderRadius: radius.sm,
		backgroundColor: Colors.secondary,
		marginLeft: spacing[4],
	},
	list: {
		flexDirection: "row",
		paddingHorizontal: spacing[4],
		gap: spacing[3],
	},
	item: {
		width: ITEM_WIDTH,
		height: ITEM_HEIGHT,
		borderRadius: radius.md,
		backgroundColor: Colors.secondary,
	},
});
