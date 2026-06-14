import { View, Text, StyleSheet } from "react-native";
import { Image } from "expo-image";
import { fontFamily } from "@/lib/constants";
import { useThemedStyles, type ThemeColors } from "@/lib/theme";

interface UserAvatarProps {
	imageUrl: string | null | undefined;
	name: string | null | undefined;
	size?: number;
}

export function UserAvatar({ imageUrl, name, size = 40 }: UserAvatarProps) {
	const styles = useThemedStyles(createStyles);
	const initials = (name ?? "?")
		.split(" ")
		.map((w) => w[0])
		.join("")
		.slice(0, 2)
		.toUpperCase();

	if (imageUrl) {
		return (
			<Image
				source={{ uri: imageUrl }}
				style={[
					styles.image,
					{ width: size, height: size, borderRadius: size / 2 },
				]}
				contentFit="cover"
				transition={0}
				cachePolicy="memory-disk"
				accessibilityLabel={name ? `${name}'s avatar` : "User avatar"}
			/>
		);
	}

	return (
		<View
			style={[
				styles.fallback,
				{ width: size, height: size, borderRadius: size / 2 },
			]}
		>
			<Text style={[styles.initials, { fontSize: size * 0.4 }]}>
				{initials}
			</Text>
		</View>
	);
}

const createStyles = (colors: ThemeColors) =>
	StyleSheet.create({
		image: {
			backgroundColor: colors.secondary,
		},
		fallback: {
			backgroundColor: colors.secondary,
			justifyContent: "center",
			alignItems: "center",
		},
		initials: {
			color: colors.mutedForeground,
			fontFamily: fontFamily.sansSemibold,
		},
	});
