import { StyleSheet, Text, View } from "react-native";
import { UserAvatar } from "@/components/user-avatar";
import { fontFamily, fontSize, radius, spacing } from "@/lib/constants";
import { useThemedStyles, type ThemeColors } from "@/lib/theme";
import { trpc } from "@/lib/trpc";

interface RecommendationBannerProps {
	movieId: number;
}

export function RecommendationBanner({ movieId }: RecommendationBannerProps) {
	const styles = useThemedStyles(createStyles);
	const { data } = trpc.recommendation.getForMovie.useQuery({ movieId });

	if (!data) {
		return null;
	}

	const senderFirstName = data.sender.name?.split(" ")[0] ?? "someone";

	return (
		<View style={styles.container}>
			<UserAvatar
				imageUrl={data.sender.image}
				name={data.sender.name}
				size={36}
			/>
			<Text style={styles.label}>
				<Text style={styles.bold}>{senderFirstName}</Text> recommended this
			</Text>
		</View>
	);
}

const createStyles = (colors: ThemeColors) =>
	StyleSheet.create({
		container: {
			flexDirection: "row",
			alignItems: "center",
			gap: spacing[3],
			backgroundColor: colors.card,
			borderRadius: radius.xl,
			borderWidth: 1,
			borderColor: colors.border,
			paddingVertical: spacing[3],
			paddingHorizontal: spacing[4],
		},
		label: {
			flex: 1,
			fontSize: fontSize.sm,
			fontFamily: fontFamily.sans,
			color: colors.foreground,
			lineHeight: 20,
		},
		bold: {
			fontFamily: fontFamily.sansSemibold,
		},
	});
