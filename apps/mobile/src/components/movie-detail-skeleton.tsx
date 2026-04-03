import { View, StyleSheet, Dimensions } from "react-native";
import { Skeleton } from "./skeleton";
import { Colors, spacing, radius } from "@/lib/constants";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const HERO_HEIGHT = SCREEN_WIDTH * 0.75;
const POSTER_WIDTH = 110;
const POSTER_HEIGHT = 165;

export function MovieDetailSkeleton() {
	return (
		<View style={styles.container}>
			<Skeleton style={styles.hero} />

			<View style={styles.infoRow}>
				<Skeleton style={styles.poster} />
				<View style={styles.titleBlock}>
					<Skeleton style={styles.titleLine} />
					<Skeleton style={styles.metaLine} />
					<Skeleton style={styles.metaLineShort} />
				</View>
			</View>

			<View style={styles.body}>
				<View style={styles.actions}>
					<Skeleton style={styles.actionButton} />
					<Skeleton style={styles.actionButton} />
				</View>

				<View style={styles.genres}>
					{Array.from({ length: 3 }, (_, i) => (
						<Skeleton key={i} style={styles.genreBadge} />
					))}
				</View>

				<View style={styles.overviewBlock}>
					<Skeleton style={styles.textLine} />
					<Skeleton style={styles.textLine} />
					<Skeleton style={styles.textLineShort} />
				</View>
			</View>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: Colors.background,
	},
	hero: {
		height: HERO_HEIGHT,
		borderRadius: 0,
	},
	infoRow: {
		flexDirection: "row",
		paddingHorizontal: spacing[4],
		gap: spacing[4],
		marginTop: -(POSTER_HEIGHT / 2),
	},
	poster: {
		width: POSTER_WIDTH,
		height: POSTER_HEIGHT,
		borderRadius: radius.lg,
	},
	titleBlock: {
		flex: 1,
		justifyContent: "flex-end",
		paddingBottom: spacing[2],
		gap: spacing[2],
	},
	titleLine: {
		height: 24,
		width: "80%",
		borderRadius: radius.sm,
	},
	metaLine: {
		height: 14,
		width: "50%",
		borderRadius: radius.sm,
	},
	metaLineShort: {
		height: 14,
		width: "35%",
		borderRadius: radius.sm,
	},
	body: {
		paddingHorizontal: spacing[4],
		paddingTop: spacing[5],
		gap: spacing[5],
	},
	actions: {
		flexDirection: "row",
		gap: spacing[3],
	},
	actionButton: {
		flex: 1,
		height: 44,
		borderRadius: radius.lg,
	},
	genres: {
		flexDirection: "row",
		gap: spacing[2],
	},
	genreBadge: {
		width: 72,
		height: 28,
		borderRadius: radius.full,
	},
	overviewBlock: {
		gap: spacing[2],
	},
	textLine: {
		height: 14,
		width: "100%",
		borderRadius: radius.sm,
	},
	textLineShort: {
		height: 14,
		width: "65%",
		borderRadius: radius.sm,
	},
});
