import { Pressable, StyleSheet, View, Text } from "react-native";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import {
	Colors,
	posterUrl,
	fontSize,
	fontFamily,
	radius,
	spacing,
} from "@/lib/constants";

interface MoviePosterProps {
	id: number;
	posterPath: string | null;
	title?: string;
	width?: number | "100%";
	height?: number;
	aspectRatio?: number;
}

export function MoviePoster({
	id,
	posterPath,
	title,
	width = 120,
	height,
	aspectRatio,
}: MoviePosterProps) {
	const sizeStyle = aspectRatio
		? { width, aspectRatio }
		: { width, height: height ?? 180 };
	const router = useRouter();
	const uri = posterUrl(posterPath);

	return (
		<Pressable
			style={({ pressed }) => [pressed && styles.pressed]}
			onPress={() => router.push(`/movie/${id}`)}
		>
			{uri ? (
				<Image
					source={{ uri }}
					style={[styles.image, sizeStyle]}
					contentFit="cover"
					recyclingKey={`poster-${id}`}
					transition={200}
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

const styles = StyleSheet.create({
	image: {
		borderRadius: radius.md,
		backgroundColor: Colors.secondary,
	},
	pressed: {
		opacity: 0.8,
	},
	placeholder: {
		borderRadius: radius.md,
		backgroundColor: Colors.secondary,
		justifyContent: "center",
		alignItems: "center",
		padding: spacing[2],
	},
	placeholderText: {
		color: Colors.mutedForeground,
		fontSize: fontSize.xs,
		fontFamily: fontFamily.sansMedium,
		textAlign: "center",
	},
});
