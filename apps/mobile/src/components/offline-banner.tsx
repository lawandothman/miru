import { StyleSheet, Text, View } from "react-native";
import Animated, {
	Easing,
	useAnimatedStyle,
	useSharedValue,
	withTiming,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useEffect } from "react";
import { useIsOnline } from "@/lib/network";
import { Colors, fontFamily, fontSize, spacing } from "@/lib/constants";

const HEIGHT = 22;
const TRANSITION_MS = 220;

export function OfflineBanner() {
	const isOnline = useIsOnline();
	const insets = useSafeAreaInsets();
	const offset = useSharedValue(-(HEIGHT + insets.top));

	useEffect(() => {
		offset.value = withTiming(isOnline ? -(HEIGHT + insets.top) : 0, {
			duration: TRANSITION_MS,
			easing: Easing.out(Easing.cubic),
		});
	}, [insets.top, isOnline, offset]);

	const animatedStyle = useAnimatedStyle(() => ({
		transform: [{ translateY: offset.value }],
	}));

	return (
		<Animated.View
			pointerEvents="none"
			style={[styles.container, { paddingTop: insets.top }, animatedStyle]}
			accessibilityLiveRegion="polite"
			accessibilityRole="alert"
		>
			<View style={styles.bar}>
				<Text style={styles.text}>No internet connection</Text>
			</View>
		</Animated.View>
	);
}

const styles = StyleSheet.create({
	container: {
		position: "absolute",
		top: 0,
		left: 0,
		right: 0,
		zIndex: 1000,
		backgroundColor: Colors.muted,
	},
	bar: {
		height: HEIGHT,
		alignItems: "center",
		justifyContent: "center",
		paddingHorizontal: spacing[3],
	},
	text: {
		fontSize: fontSize.xs,
		fontFamily: fontFamily.sansMedium,
		color: Colors.mutedForeground,
	},
});
