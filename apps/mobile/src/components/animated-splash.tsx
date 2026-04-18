import { useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";
import Animated, {
	Easing,
	runOnJS,
	useAnimatedStyle,
	useSharedValue,
	withDelay,
	withTiming,
} from "react-native-reanimated";
import { fontFamily, fontSize } from "@/lib/constants";
import { SPLASH_BACKGROUND, SplashMark } from "@/components/splash-mark";

const WORDMARK_COLOR = "#ffffff";
const TAGLINE_COLOR = "rgba(255, 255, 255, 0.55)";
const RULE_COLOR = "rgba(255, 255, 255, 0.28)";

const INTRO_DURATION_MS = 880;
const EXIT_DURATION_MS = 420;

type Props = {
	ready: boolean;
	onExit: () => void;
};

export function AnimatedSplash({ ready, onExit }: Props) {
	const [introCompleted, setIntroCompleted] = useState(false);

	const overlayOpacity = useSharedValue(1);
	const wordmarkOpacity = useSharedValue(0);
	const wordmarkOffset = useSharedValue(10);
	const taglineOpacity = useSharedValue(0);
	const taglineOffset = useSharedValue(6);
	const ruleScale = useSharedValue(0);
	const ruleOpacity = useSharedValue(0);

	useEffect(() => {
		const easeOutExpo = Easing.out(Easing.exp);
		const easeOutQuad = Easing.out(Easing.quad);

		wordmarkOpacity.value = withDelay(
			200,
			withTiming(1, { duration: 360, easing: easeOutExpo }),
		);
		wordmarkOffset.value = withDelay(
			200,
			withTiming(0, { duration: 360, easing: easeOutExpo }),
		);
		taglineOpacity.value = withDelay(
			340,
			withTiming(1, { duration: 320, easing: easeOutExpo }),
		);
		taglineOffset.value = withDelay(
			340,
			withTiming(0, { duration: 320, easing: easeOutExpo }),
		);
		ruleScale.value = withDelay(
			540,
			withTiming(1, { duration: 340, easing: easeOutQuad }),
		);
		ruleOpacity.value = withDelay(
			540,
			withTiming(1, { duration: 340, easing: easeOutQuad }),
		);

		const timer = setTimeout(() => setIntroCompleted(true), INTRO_DURATION_MS);
		return () => clearTimeout(timer);
	}, [
		ruleOpacity,
		ruleScale,
		taglineOffset,
		taglineOpacity,
		wordmarkOffset,
		wordmarkOpacity,
	]);

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
	const ruleStyle = useAnimatedStyle(() => ({
		opacity: ruleOpacity.value,
		transform: [{ scaleX: ruleScale.value }],
	}));

	return (
		<Animated.View
			pointerEvents="none"
			style={[StyleSheet.absoluteFill, styles.root, overlayStyle]}
		>
			<View style={StyleSheet.absoluteFill}>
				<SplashMark />
			</View>
			<View style={styles.title}>
				<Animated.Text style={[styles.wordmark, wordmarkStyle]}>
					MIRU
				</Animated.Text>
				<Animated.Text style={[styles.tagline, taglineStyle]}>
					Watch together
				</Animated.Text>
				<Animated.View style={[styles.rule, ruleStyle]} />
			</View>
		</Animated.View>
	);
}

const styles = StyleSheet.create({
	root: {
		backgroundColor: SPLASH_BACKGROUND,
	},
	title: {
		position: "absolute",
		left: 0,
		right: 0,
		bottom: "18%",
		alignItems: "center",
	},
	wordmark: {
		fontFamily: fontFamily.displayBold,
		fontSize: fontSize["3xl"],
		color: WORDMARK_COLOR,
		letterSpacing: 10,
	},
	tagline: {
		fontFamily: fontFamily.sansMedium,
		fontSize: fontSize.xs,
		color: TAGLINE_COLOR,
		letterSpacing: 3,
		marginTop: 10,
		textTransform: "uppercase",
	},
	rule: {
		width: 64,
		height: 1,
		backgroundColor: RULE_COLOR,
		marginTop: 22,
	},
});
