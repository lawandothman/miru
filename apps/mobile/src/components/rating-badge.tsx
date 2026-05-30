import { View, StyleSheet, type StyleProp, type ViewStyle } from "react-native";
import { RATING_META } from "@/lib/ratings";
import { Colors } from "@/lib/constants";
import type { MovieRating } from "@/lib/types";

interface RatingBadgeProps {
	rating: MovieRating;
	size?: number;
	style?: StyleProp<ViewStyle>;
}

export function RatingBadge({ rating, size = 20, style }: RatingBadgeProps) {
	const meta = RATING_META[rating];
	const Icon = meta.icon;

	return (
		<View
			style={[
				styles.badge,
				{
					width: size,
					height: size,
					borderRadius: size / 2,
					backgroundColor: Colors[meta.colorKey],
				},
				style,
			]}
		>
			<Icon
				size={size * 0.55}
				color={Colors.background}
				fill={Colors.background}
			/>
		</View>
	);
}

const styles = StyleSheet.create({
	badge: {
		alignItems: "center",
		justifyContent: "center",
		borderWidth: 2,
		borderColor: Colors.background,
	},
});
