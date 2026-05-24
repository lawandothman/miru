import { Pressable, StyleSheet, View, Text } from "react-native";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import {
	posterUrl,
	fontSize,
	fontFamily,
	radius,
	spacing,
} from "@/lib/constants";
import { useThemedStyles, type ThemeColors } from "@/lib/theme";

interface MoviePosterProps {
	id: number;
	posterPath: string | null;
	title?: string;
	width?: number | "100%";
	height?: number;
	aspectRatio?: number;
	transition?: number;
}

export function MoviePoster({
	id,
	posterPath,
	title,
	width = 120,
	height,
	aspectRatio,
	transition = 0,
}: MoviePosterProps) {
	const styles = useThemedStyles(createStyles);
	const sizeStyle = aspectRatio
		? { width, aspectRatio }
		: { width, height: height ?? 180 };
	const router = useRouter();
	const uri = posterUrl(posterPath);

	return (
		<Pressable
			onPress={() => router.push(`/movie/${id}`)}
			accessibilityRole="button"
			accessibilityLabel={title ? `View ${title}` : `View movie`}
		>
			{uri ? (
				<Image
					source={{ uri }}
					style={[styles.image, sizeStyle]}
					contentFit="cover"
					recyclingKey={`poster-${id}`}
					transition={transition}
					cachePolicy="memory-disk"
				/>
			) : (
				<View style={[styles.placeholder, sizeStyle]}>
					<Text style={styles.placeholderText} numberOfLines={2}>
						{title ?? ""}
					</Text>
				</View>
			)}
		</Pressable>
	);
}

const createStyles = (colors: ThemeColors) =>
	StyleSheet.create({
		image: {
			borderRadius: radius.md,
			backgroundColor: colors.secondary,
		},
		placeholder: {
			borderRadius: radius.md,
			backgroundColor: colors.secondary,
			justifyContent: "center",
			alignItems: "center",
			padding: spacing[2],
		},
		placeholderText: {
			color: colors.mutedForeground,
			fontSize: fontSize.xs,
			fontFamily: fontFamily.sansMedium,
			textAlign: "center",
		},
	});
