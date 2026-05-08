import { View, Pressable, Dimensions, StyleSheet } from "react-native";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ChevronLeft, Share2 } from "lucide-react-native";
import {
	backdropUrl,
	Colors,
	getThemePalette,
	spacing,
	useResolvedColorScheme,
} from "@/lib/constants";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const HERO_HEIGHT = SCREEN_WIDTH * 0.75;

interface MovieHeroProps {
	backdropPath: string | null | undefined;
	onBack: () => void;
	onShare: () => void;
	sharePending: boolean;
}

export function MovieHero({
	backdropPath,
	onBack,
	onShare,
	sharePending,
}: MovieHeroProps) {
	const insets = useSafeAreaInsets();
	const resolvedScheme = useResolvedColorScheme();
	const palette = getThemePalette(resolvedScheme);

	return (
		<View style={styles.heroContainer}>
			{backdropPath ? (
				<Image
					source={{ uri: backdropUrl(backdropPath) }}
					style={styles.heroImage}
					contentFit="cover"
				/>
			) : (
				<View style={[styles.heroImage, styles.heroPlaceholder]} />
			)}

			<LinearGradient
				colors={[
					"transparent",
					resolvedScheme === "light"
						? "rgba(250, 250, 250, 0.6)"
						: "rgba(1, 1, 1, 0.6)",
					palette.background,
				]}
				locations={[0, 0.55, 1]}
				style={styles.heroGradient}
			/>

			<View
				style={[styles.heroNav, { top: insets.top + spacing[2] }]}
				pointerEvents="box-none"
			>
				<Pressable
					style={({ pressed }) => [
						styles.heroButton,
						pressed && styles.heroButtonPressed,
					]}
					onPress={onBack}
					accessibilityRole="button"
					accessibilityLabel="Go back"
				>
					<ChevronLeft size={20} color="#fff" />
				</Pressable>

				<Pressable
					style={({ pressed }) => [
						styles.heroButton,
						pressed && styles.heroButtonPressed,
					]}
					accessibilityRole="button"
					accessibilityLabel="Share movie"
					onPress={onShare}
					disabled={sharePending}
				>
					<Share2 size={18} color="#fff" />
				</Pressable>
			</View>
		</View>
	);
}

const styles = StyleSheet.create({
	heroContainer: {
		height: HERO_HEIGHT,
		position: "relative",
	},
	heroImage: {
		...StyleSheet.absoluteFillObject,
	},
	heroPlaceholder: {
		backgroundColor: Colors.secondary,
	},
	heroGradient: {
		...StyleSheet.absoluteFillObject,
	},
	heroNav: {
		position: "absolute",
		left: spacing[4],
		right: spacing[4],
		flexDirection: "row",
		justifyContent: "space-between",
	},
	heroButton: {
		width: 44,
		height: 44,
		borderRadius: 22,
		backgroundColor: "rgba(0,0,0,0.45)",
		justifyContent: "center",
		alignItems: "center",
	},
	heroButtonPressed: {
		opacity: 0.7,
	},
});
