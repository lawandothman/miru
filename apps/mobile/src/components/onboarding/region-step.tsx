import { useState } from "react";
import { View, Text, Pressable, ScrollView, StyleSheet } from "react-native";
import { Check } from "lucide-react-native";
import {
	COUNTRIES,
	countryFlag,
	detectCountryFromTimezone,
} from "@/lib/region-data";
import { Colors, fontSize, fontFamily, spacing, radius } from "@/lib/constants";

interface RegionStepProps {
	country: string | null;
	onSelect: (code: string) => void;
}

export function RegionStep({ country, onSelect }: RegionStepProps) {
	const [selected, setSelected] = useState<string | null>(
		() => country ?? detectCountryFromTimezone(),
	);

	// Notify parent of auto-detected country on mount
	if (!country && selected) {
		onSelect(selected);
	}

	function handleSelect(code: string) {
		setSelected(code);
		onSelect(code);
	}

	return (
		<ScrollView
			style={styles.container}
			contentContainerStyle={styles.content}
			showsVerticalScrollIndicator={false}
		>
			<Text style={styles.title}>Where are you?</Text>
			<Text style={styles.subtitle}>
				This helps us show the right streaming services for your region.
			</Text>
			<View style={styles.list}>
				{COUNTRIES.map((c) => {
					const isSelected = selected === c.code;
					return (
						<Pressable
							key={c.code}
							style={[styles.item, isSelected && styles.itemSelected]}
							onPress={() => handleSelect(c.code)}
						>
							<Text style={styles.flag}>{countryFlag(c.code)}</Text>
							<Text style={styles.countryName}>{c.name}</Text>
							{isSelected && <Check size={18} color={Colors.primary} />}
						</Pressable>
					);
				})}
			</View>
		</ScrollView>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
	},
	content: {
		padding: spacing[4],
		paddingBottom: spacing[8],
		gap: spacing[4],
	},
	title: {
		fontSize: fontSize["2xl"],
		fontFamily: fontFamily.displayBold,
		color: Colors.foreground,
	},
	subtitle: {
		fontSize: fontSize.base,
		fontFamily: fontFamily.sans,
		color: Colors.mutedForeground,
		lineHeight: 22,
	},
	list: {
		backgroundColor: Colors.card,
		borderRadius: radius.xl,
		overflow: "hidden",
	},
	item: {
		flexDirection: "row",
		alignItems: "center",
		gap: spacing[3],
		paddingHorizontal: spacing[4],
		paddingVertical: spacing[3],
		borderBottomWidth: StyleSheet.hairlineWidth,
		borderBottomColor: Colors.border,
	},
	itemSelected: {
		backgroundColor: `${Colors.primary}15`,
	},
	flag: {
		fontSize: fontSize.xl,
	},
	countryName: {
		flex: 1,
		fontSize: fontSize.base,
		fontFamily: fontFamily.sans,
		color: Colors.foreground,
	},
});
