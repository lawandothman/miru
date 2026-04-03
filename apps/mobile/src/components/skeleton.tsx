import { useEffect, useState } from "react";
import { Animated, Easing, type ViewStyle } from "react-native";
import { Colors, radius } from "@/lib/constants";

interface SkeletonProps {
	style?: ViewStyle;
}

export function Skeleton({ style }: SkeletonProps) {
	const [opacity] = useState(() => new Animated.Value(0.35));

	useEffect(() => {
		const anim = Animated.loop(
			Animated.sequence([
				Animated.timing(opacity, {
					toValue: 1,
					duration: 800,
					easing: Easing.inOut(Easing.ease),
					useNativeDriver: true,
				}),
				Animated.timing(opacity, {
					toValue: 0.35,
					duration: 800,
					easing: Easing.inOut(Easing.ease),
					useNativeDriver: true,
				}),
			]),
		);
		anim.start();
		return () => anim.stop();
	}, [opacity]);

	return (
		<Animated.View
			style={[
				{
					backgroundColor: Colors.secondary,
					borderRadius: radius.md,
					opacity,
				},
				style,
			]}
		/>
	);
}
