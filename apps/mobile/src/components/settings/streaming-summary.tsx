import { View, Text, Pressable, StyleSheet } from "react-native";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { ChevronRight } from "lucide-react-native";
import { trpc } from "@/lib/trpc";
import {
	Colors,
	fontSize,
	fontFamily,
	spacing,
	radius,
	providerLogoUrl,
} from "@/lib/constants";

export function StreamingSummary() {
	const router = useRouter();
	const { data: providers } = trpc.movie.getWatchProviders.useQuery();
	const { data: state } = trpc.onboarding.getState.useQuery();

	const selectedProviders =
		providers?.filter((p) => state?.providerIds.includes(p.id)) ?? [];

	return (
		<Pressable
			style={({ pressed }) => [styles.summaryRow, pressed && styles.pressed]}
			onPress={() => router.push("/settings-streaming")}
		>
			<View style={styles.summaryContent}>
				{selectedProviders.length > 0 ? (
					<View style={styles.logoPreview}>
						{selectedProviders.slice(0, 6).map((p) => {
							const logo = providerLogoUrl(p.logoPath);
							return logo ? (
								<Image
									key={p.id}
									source={{ uri: logo }}
									style={styles.logoSmall}
									contentFit="cover"
								/>
							) : null;
						})}
						{selectedProviders.length > 6 && (
							<Text style={styles.moreText}>
								+{selectedProviders.length - 6}
							</Text>
						)}
					</View>
				) : (
					<Text style={styles.placeholderText}>No services selected</Text>
				)}
			</View>
			<ChevronRight size={18} color={Colors.mutedForeground} />
		</Pressable>
	);
}

const styles = StyleSheet.create({
	summaryRow: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
		gap: spacing[3],
	},
	summaryContent: {
		flex: 1,
	},
	pressed: {
		opacity: 0.7,
	},
	placeholderText: {
		fontSize: fontSize.sm,
		fontFamily: fontFamily.sans,
		color: Colors.mutedForeground,
	},
	moreText: {
		fontSize: fontSize.xs,
		fontFamily: fontFamily.sansMedium,
		color: Colors.mutedForeground,
		alignSelf: "center",
	},
	logoPreview: {
		flexDirection: "row",
		gap: spacing[2],
		alignItems: "center",
	},
	logoSmall: {
		width: 36,
		height: 36,
		borderRadius: radius.md,
	},
});
