import { Alert, View, Text, Pressable, StyleSheet } from "react-native";
import { useRateMovie } from "@/hooks/use-rate-movie";
import { RATING_META, RATING_ORDER } from "@/lib/ratings";
import { Colors, fontSize, fontFamily, spacing, radius } from "@/lib/constants";
import { triggerWatchedHaptic } from "@/lib/haptics";
import { useIsOnline } from "@/lib/network";
import type { MovieRating } from "@/lib/types";

interface RateMovieProps {
	movieId: number;
	rating: MovieRating | null;
}

export function RateMovie({ movieId, rating }: RateMovieProps) {
	const isOnline = useIsOnline();
	const rate = useRateMovie(movieId);

	function handlePress(value: MovieRating) {
		if (!isOnline) {
			Alert.alert("No internet", "Connect to the internet to rate movies.");
			return;
		}

		triggerWatchedHaptic();
		// Tapping the active reaction again clears it back to neutral.
		rate.mutate({ movieId, rating: rating === value ? null : value });
	}

	return (
		<View style={styles.container}>
			<Text style={styles.title}>Your rating</Text>
			<View style={styles.options}>
				{RATING_ORDER.map((value) => {
					const meta = RATING_META[value];
					const Icon = meta.icon;
					const isActive = rating === value;
					const activeColor = Colors[meta.colorKey];

					return (
						<Pressable
							key={value}
							style={({ pressed }) => [
								styles.option,
								isActive && { borderColor: activeColor },
								pressed && styles.pressed,
								!isOnline && styles.offline,
							]}
							onPress={() => handlePress(value)}
							accessibilityRole="button"
							accessibilityState={{ selected: isActive }}
							accessibilityLabel={meta.label}
						>
							<Icon
								size={22}
								color={isActive ? activeColor : Colors.mutedForeground}
								fill={isActive ? activeColor : "transparent"}
							/>
							<Text
								style={[styles.optionLabel, isActive && { color: activeColor }]}
							>
								{meta.label}
							</Text>
						</Pressable>
					);
				})}
			</View>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		gap: spacing[3],
	},
	title: {
		fontSize: fontSize.base,
		fontFamily: fontFamily.displaySemibold,
		color: Colors.foreground,
	},
	options: {
		flexDirection: "row",
		gap: spacing[3],
	},
	option: {
		flex: 1,
		alignItems: "center",
		gap: spacing[2],
		paddingVertical: spacing[3],
		borderRadius: radius.lg,
		backgroundColor: Colors.secondary,
		borderWidth: 1,
		borderColor: "transparent",
	},
	optionLabel: {
		fontSize: fontSize.xs,
		fontFamily: fontFamily.sansMedium,
		color: Colors.mutedForeground,
	},
	pressed: {
		opacity: 0.8,
	},
	offline: {
		opacity: 0.5,
	},
});
