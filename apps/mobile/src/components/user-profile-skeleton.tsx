import { View, StyleSheet } from "react-native";
import { Skeleton } from "./skeleton";
import { CarouselSkeleton } from "./carousel-skeleton";
import { Colors, spacing, radius } from "@/lib/constants";

export function UserProfileSkeleton() {
	return (
		<View style={styles.container}>
			<View style={styles.header}>
				<Skeleton style={styles.avatar} />
				<Skeleton style={styles.name} />
				<View style={styles.statsRow}>
					<Skeleton style={styles.stat} />
					<Skeleton style={styles.stat} />
				</View>
				<Skeleton style={styles.followButton} />
			</View>

			<CarouselSkeleton />
			<CarouselSkeleton />
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: Colors.background,
		gap: spacing[6],
	},
	header: {
		alignItems: "center",
		paddingTop: spacing[6],
		gap: spacing[3],
	},
	avatar: {
		width: 80,
		height: 80,
		borderRadius: 40,
	},
	name: {
		width: 140,
		height: 24,
		borderRadius: radius.sm,
	},
	statsRow: {
		flexDirection: "row",
		gap: spacing[6],
	},
	stat: {
		width: 60,
		height: 36,
		borderRadius: radius.sm,
	},
	followButton: {
		width: 120,
		height: 36,
		borderRadius: radius.lg,
	},
});
