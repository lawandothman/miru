import { View, StyleSheet } from "react-native";
import { Skeleton } from "./skeleton";
import { spacing } from "@/lib/constants";

const NUM_COLUMNS = 3;
const ITEM_GAP = spacing[2];
const ROW_COUNT = 4;

export function MovieGridSkeleton() {
	return (
		<View style={styles.container}>
			{Array.from({ length: ROW_COUNT }, (_r, row) => (
				<View key={row} style={styles.row}>
					{Array.from({ length: NUM_COLUMNS }, (_c, col) => (
						<Skeleton key={col} style={styles.item} />
					))}
				</View>
			))}
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		paddingHorizontal: spacing[4],
		paddingTop: spacing[4],
		gap: ITEM_GAP,
	},
	row: {
		flexDirection: "row",
		gap: ITEM_GAP,
	},
	item: {
		flex: 1,
		aspectRatio: 2 / 3,
	},
});
