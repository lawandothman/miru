import { useEffect, useState } from "react";
import { Animated, Easing, type ColorValue } from "react-native";
import Svg, { Circle } from "react-native-svg";
import { useTheme } from "@/lib/theme";

interface SpinnerProps {
	size?: number;
	color?: ColorValue;
	strokeWidth?: number;
}

export function Spinner({
	size = 24,
	color,
	strokeWidth = 2.5,
}: SpinnerProps) {
	const { colors } = useTheme();
	const resolvedColor = color ?? colors.mutedForeground;
	const [rotation] = useState(() => new Animated.Value(0));
	const r = (size - strokeWidth) / 2;
	const circumference = 2 * Math.PI * r;

	useEffect(() => {
		const anim = Animated.loop(
			Animated.timing(rotation, {
				toValue: 1,
				duration: 700,
				easing: Easing.linear,
				useNativeDriver: true,
			}),
		);
		anim.start();
		return () => anim.stop();
	}, [rotation]);

	const spin = rotation.interpolate({
		inputRange: [0, 1],
		outputRange: ["0deg", "360deg"],
	});

	return (
		<Animated.View style={{ transform: [{ rotate: spin }] }}>
			<Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
				<Circle
					cx={size / 2}
					cy={size / 2}
					r={r}
					stroke={resolvedColor}
					strokeWidth={strokeWidth}
					fill="none"
					opacity={0.15}
				/>
				<Circle
					cx={size / 2}
					cy={size / 2}
					r={r}
					stroke={resolvedColor}
					strokeWidth={strokeWidth}
					fill="none"
					strokeDasharray={`${circumference * 0.3} ${circumference * 0.7}`}
					strokeLinecap="round"
				/>
			</Svg>
		</Animated.View>
	);
}
