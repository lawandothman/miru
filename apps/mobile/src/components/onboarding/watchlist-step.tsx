import {
	View,
	Text,
	Pressable,
	FlatList,
	ActivityIndicator,
	StyleSheet,
	Dimensions,
} from "react-native";
import { Image } from "expo-image";
import { Check } from "lucide-react-native";
import { trpc } from "@/lib/trpc";
import {
	Colors,
	fontSize,
	fontFamily,
	spacing,
	radius,
	posterUrl,
} from "@/lib/constants";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const NUM_COLUMNS = 3;
const ITEM_GAP = 12;
const HORIZONTAL_PADDING = 16;
const POSTER_WIDTH =
	(SCREEN_WIDTH - HORIZONTAL_PADDING * 2 - ITEM_GAP * (NUM_COLUMNS - 1)) /
	NUM_COLUMNS;
const POSTER_HEIGHT = POSTER_WIDTH * 1.5;

interface WatchlistStepProps {
	genreIds: number[];
	watchlistIds: Set<number>;
	onToggle: (movieId: number) => void;
}

export function WatchlistStep({
	genreIds,
	watchlistIds,
	onToggle,
}: WatchlistStepProps) {
	const { data: movies, isLoading } =
		trpc.onboarding.getRecommendedMovies.useQuery(
			{ genreIds, limit: 20 },
			{ enabled: genreIds.length > 0 },
		);

	return (
		<View style={styles.container}>
			<View style={styles.header}>
				<Text style={styles.title}>Build your watchlist</Text>
				<Text style={styles.subtitle}>
					Tap movies you want to watch. You can skip this step.
				</Text>
			</View>

			{isLoading ? (
				<View style={styles.loadingContainer}>
					<ActivityIndicator color={Colors.primary} size="large" />
				</View>
			) : (
				<FlatList
					data={movies}
					numColumns={NUM_COLUMNS}
					keyExtractor={(item) => String(item.id)}
					contentContainerStyle={styles.gridContent}
					columnWrapperStyle={styles.row}
					showsVerticalScrollIndicator={false}
					renderItem={({ item }) => {
						const isAdded = watchlistIds.has(item.id);
						const poster = posterUrl(item.posterPath);
						return (
							<Pressable
								style={styles.posterContainer}
								onPress={() => onToggle(item.id)}
							>
								{poster ? (
									<Image
										source={{ uri: poster }}
										style={styles.poster}
										contentFit="cover"
										transition={200}
									/>
								) : (
									<View style={[styles.poster, styles.posterFallback]}>
										<Text style={styles.posterFallbackText} numberOfLines={3}>
											{item.title}
										</Text>
									</View>
								)}
								{isAdded && (
									<View style={styles.checkOverlay}>
										<View style={styles.checkCircle}>
											<Check size={20} color={Colors.primaryForeground} />
										</View>
									</View>
								)}
							</Pressable>
						);
					}}
				/>
			)}
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
	},
	header: {
		paddingHorizontal: HORIZONTAL_PADDING,
		gap: spacing[2],
		paddingBottom: spacing[4],
	},
	title: {
		fontSize: fontSize["2xl"],
		fontFamily: fontFamily.displayBold,
		color: Colors.foreground,
	},
	subtitle: {
		fontSize: fontSize.base,
		fontFamily: fontFamily.sans,
		color: Colors.mutedForeground,
		lineHeight: 22,
	},
	loadingContainer: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
	},
	gridContent: {
		paddingHorizontal: HORIZONTAL_PADDING,
		paddingBottom: spacing[8],
		gap: ITEM_GAP,
	},
	row: {
		gap: ITEM_GAP,
	},
	posterContainer: {
		width: POSTER_WIDTH,
		height: POSTER_HEIGHT,
		borderRadius: radius.lg,
		overflow: "hidden",
		position: "relative",
	},
	poster: {
		width: "100%",
		height: "100%",
	},
	posterFallback: {
		backgroundColor: Colors.card,
		justifyContent: "center",
		alignItems: "center",
		padding: spacing[2],
	},
	posterFallbackText: {
		fontSize: fontSize.xs,
		fontFamily: fontFamily.sans,
		color: Colors.mutedForeground,
		textAlign: "center",
	},
	checkOverlay: {
		...StyleSheet.absoluteFillObject,
		backgroundColor: "rgba(0, 0, 0, 0.5)",
		justifyContent: "center",
		alignItems: "center",
	},
	checkCircle: {
		width: 40,
		height: 40,
		borderRadius: 20,
		backgroundColor: Colors.primary,
		justifyContent: "center",
		alignItems: "center",
	},
});
