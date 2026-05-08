import { Text, Pressable, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { ChevronRight } from "lucide-react-native";
import { trpc } from "@/lib/trpc";
import { Colors, fontSize, fontFamily, spacing } from "@/lib/constants";
import { COUNTRIES, countryFlag } from "@/lib/region-data";

export function RegionSummary() {
	const router = useRouter();
	const { data: state } = trpc.onboarding.getState.useQuery();

	const current = COUNTRIES.find((c) => c.code === state?.country);

	return (
		<Pressable
			style={({ pressed }) => [styles.summaryRow, pressed && styles.pressed]}
			onPress={() => router.push("/settings-region")}
		>
			<Text style={styles.regionSummaryText}>
				{current
					? `${countryFlag(current.code)} ${current.name}`
					: "Select a region"}
			</Text>
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
	pressed: {
		opacity: 0.7,
	},
	regionSummaryText: {
		fontSize: fontSize.base,
		fontFamily: fontFamily.sans,
		color: Colors.foreground,
	},
});
