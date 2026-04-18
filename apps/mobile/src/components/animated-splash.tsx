import { useEffect, useMemo, useState } from "react";
import { StyleSheet, View } from "react-native";
import Animated, {
	Easing,
	runOnJS,
	useAnimatedStyle,
	useSharedValue,
	withDelay,
	withTiming,
} from "react-native-reanimated";
import { Colors, fontFamily, fontSize, spacing } from "@/lib/constants";
import { useSplashScheme } from "@/hooks/use-splash-scheme";
import { splashBackgroundFor, SplashMark } from "@/components/splash-mark";

const INTRO_DURATION_MS = 820;
const EXIT_DURATION_MS = 420;

type Props = {
	ready: boolean;
	onExit: () => void;
};

export function AnimatedSplash({ ready, onExit }: Props) {
	const scheme = useSplashScheme();
	const background = splashBackgroundFor(scheme);

	const [introCompleted, setIntroCompleted] = useState(false);

	const overlayOpacity = useSharedValue(1);
	const wordmarkOpacity = useSharedValue(0);
	const wordmarkOffset = useSharedValue(10);
	const taglineOpacity = useSharedValue(0);
	const taglineOffset = useSharedValue(6);

	useEffect(() => {
		const ease = Easing.out(Easing.exp);

		wordmarkOpacity.value = withDelay(
			200,
			withTiming(1, { duration: 360, easing: ease }),
		);
		wordmarkOffset.value = withDelay(
			200,
			withTiming(0, { duration: 360, easing: ease }),
		);
		taglineOpacity.value = withDelay(
			340,
			withTiming(1, { duration: 320, easing: ease }),
		);
		taglineOffset.value = withDelay(
			340,
			withTiming(0, { duration: 320, easing: ease }),
		);

		const timer = setTimeout(() => setIntroCompleted(true), INTRO_DURATION_MS);
		return () => clearTimeout(timer);
	}, [taglineOffset, taglineOpacity, wordmarkOffset, wordmarkOpacity]);

	useEffect(() => {
		if (!ready || !introCompleted) {
			return;
		}
		overlayOpacity.value = withTiming(
			0,
			{ duration: EXIT_DURATION_MS, easing: Easing.out(Easing.exp) },
			(finished) => {
				if (finished) {
					runOnJS(onExit)();
				}
			},
		);
	}, [introCompleted, onExit, overlayOpacity, ready]);

	const overlayStyle = useAnimatedStyle(() => ({
		opacity: overlayOpacity.value,
	}));
	const wordmarkStyle = useAnimatedStyle(() => ({
		opacity: wordmarkOpacity.value,
		transform: [{ translateY: wordmarkOffset.value }],
	}));
	const taglineStyle = useAnimatedStyle(() => ({
		opacity: taglineOpacity.value,
		transform: [{ translateY: taglineOffset.value }],
	}));

	const rootStyle = useMemo(
		() => ({ backgroundColor: background }),
		[background],
	);

	return (
		<Animated.View
			pointerEvents="none"
			style={[StyleSheet.absoluteFill, rootStyle, overlayStyle]}
		>
			<View style={StyleSheet.absoluteFill}>
				<SplashMark />
			</View>
			<View style={styles.title}>
				<Animated.Text style={[styles.wordmark, wordmarkStyle]}>
					Miru
				</Animated.Text>
				<Animated.Text style={[styles.tagline, taglineStyle]}>
					Watch together
				</Animated.Text>
			</View>
		</Animated.View>
	);
}

const styles = StyleSheet.create({
	title: {
		position: "absolute",
		left: 0,
		right: 0,
		bottom: "18%",
		alignItems: "center",
	},
	wordmark: {
		fontSize: fontSize["5xl"],
		fontFamily: fontFamily.displayBold,
		color: Colors.foreground,
		letterSpacing: -2,
	},
	tagline: {
		fontSize: fontSize.lg,
		fontFamily: fontFamily.sans,
		color: Colors.mutedForeground,
		marginTop: spacing[2],
	},
});
