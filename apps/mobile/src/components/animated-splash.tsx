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

const WORDMARK = "Miru";
const LETTERS = Array.from(WORDMARK);

const LETTER_START_MS = 80;
const LETTER_STAGGER_MS = 72;
const LETTER_DURATION_MS = 640;
const LETTER_TRANSLATE_Y = 28;
const LETTER_SCALE_FROM = 0.9;

const TAGLINE_START_MS = 480;
const TAGLINE_DURATION_MS = 520;
const TAGLINE_TRANSLATE_Y = 14;

const LAST_LETTER_END_MS =
	LETTER_START_MS +
	(LETTERS.length - 1) * LETTER_STAGGER_MS +
	LETTER_DURATION_MS;
const TAGLINE_END_MS = TAGLINE_START_MS + TAGLINE_DURATION_MS;
const INTRO_DURATION_MS = Math.max(LAST_LETTER_END_MS, TAGLINE_END_MS);

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
	const taglineOpacity = useSharedValue(0);
	const taglineOffset = useSharedValue(TAGLINE_TRANSLATE_Y);

	useEffect(() => {
		const ease = Easing.out(Easing.exp);

		taglineOpacity.value = withDelay(
			TAGLINE_START_MS,
			withTiming(1, { duration: TAGLINE_DURATION_MS, easing: ease }),
		);
		taglineOffset.value = withDelay(
			TAGLINE_START_MS,
			withTiming(0, { duration: TAGLINE_DURATION_MS, easing: ease }),
		);

		const timer = setTimeout(() => setIntroCompleted(true), INTRO_DURATION_MS);
		return () => clearTimeout(timer);
	}, [taglineOffset, taglineOpacity]);

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
				<View
					style={styles.wordmarkRow}
					accessible
					accessibilityRole="header"
					accessibilityLabel={WORDMARK}
				>
					{LETTERS.map((char, i) => (
						<WordmarkLetter
							key={char}
							char={char}
							index={i}
							isLast={i === LETTERS.length - 1}
						/>
					))}
				</View>
				<Animated.Text style={[styles.tagline, taglineStyle]}>
					Watch together
				</Animated.Text>
			</View>
		</Animated.View>
	);
}

function WordmarkLetter({
	char,
	index,
	isLast,
}: {
	char: string;
	index: number;
	isLast: boolean;
}) {
	const opacity = useSharedValue(0);
	const translateY = useSharedValue(LETTER_TRANSLATE_Y);
	const scale = useSharedValue(LETTER_SCALE_FROM);

	useEffect(() => {
		const delay = LETTER_START_MS + index * LETTER_STAGGER_MS;
		const ease = Easing.out(Easing.exp);
		const duration = LETTER_DURATION_MS;

		opacity.value = withDelay(delay, withTiming(1, { duration, easing: ease }));
		translateY.value = withDelay(
			delay,
			withTiming(0, { duration, easing: ease }),
		);
		scale.value = withDelay(delay, withTiming(1, { duration, easing: ease }));
	}, [index, opacity, scale, translateY]);

	const style = useAnimatedStyle(() => ({
		opacity: opacity.value,
		transform: [{ translateY: translateY.value }, { scale: scale.value }],
	}));

	return (
		<Animated.Text
			style={[styles.wordmark, !isLast && styles.wordmarkTracking, style]}
		>
			{char}
		</Animated.Text>
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
	wordmarkRow: {
		flexDirection: "row",
	},
	wordmark: {
		fontSize: fontSize["5xl"],
		fontFamily: fontFamily.displayBold,
		color: Colors.foreground,
		// Scale pivots from the baseline so letters rise into place.
		transformOrigin: "bottom",
	},
	// Approximates `letterSpacing: -2` across split-per-letter Text nodes
	// (RN kerns within a single text run, not between sibling views).
	wordmarkTracking: {
		marginRight: -2,
	},
	tagline: {
		fontSize: fontSize.lg,
		fontFamily: fontFamily.sans,
		color: Colors.mutedForeground,
		marginTop: spacing[2],
	},
});
