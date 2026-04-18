import { useCallback, useEffect, useState } from "react";
import { View, Text, Pressable, FlatList, StyleSheet } from "react-native";
import { Check } from "lucide-react-native";
import {
	COUNTRIES,
	countryFlag,
	detectCountryFromTimezone,
} from "@/lib/region-data";
import {
	Colors,
	dynamicColorAlpha,
	fontSize,
	fontFamily,
	spacing,
	radius,
} from "@/lib/constants";

interface RegionStepProps {
	country: string | null;
	onSelect: (code: string) => void;
}

const ITEM_HEIGHT = 49;

export function RegionStep({ country, onSelect }: RegionStepProps) {
	const [selected, setSelected] = useState<string | null>(
		() => country ?? detectCountryFromTimezone(),
	);

	useEffect(() => {
		if (!country && selected) {
			onSelect(selected);
		}
	}, [country, onSelect, selected]);

	function handleSelect(code: string) {
		setSelected(code);
		onSelect(code);
	}

	const renderItem = useCallback(
		({ item: c }: { item: (typeof COUNTRIES)[number] }) => {
			const isSelected = selected === c.code;
			return (
				<Pressable
					style={[styles.item, isSelected && styles.itemSelected]}
					onPress={() => handleSelect(c.code)}
					accessibilityRole="radio"
					accessibilityLabel={c.name}
					accessibilityState={{ selected: isSelected }}
				>
					<Text style={styles.flag}>{countryFlag(c.code)}</Text>
					<Text style={styles.countryName}>{c.name}</Text>
					{isSelected && <Check size={18} color={Colors.primary} />}
				</Pressable>
			);
		},
		[selected],
	);

	return (
		<View style={styles.container}>
			<View style={styles.header}>
				<Text style={styles.title}>Let's set your region</Text>
				<Text style={styles.subtitle}>
					We use your region to show what&apos;s streaming near you. You can
					change it later.
				</Text>
			</View>
			<FlatList
				data={COUNTRIES}
				renderItem={renderItem}
				keyExtractor={(c) => c.code}
				getItemLayout={(_, index) => ({
					length: ITEM_HEIGHT,
					offset: ITEM_HEIGHT * index,
					index,
				})}
				style={styles.list}
				showsVerticalScrollIndicator={false}
				initialNumToRender={15}
				windowSize={7}
			/>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		padding: spacing[4],
		paddingBottom: spacing[8],
		gap: spacing[4],
	},
	header: {
		gap: spacing[2],
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
		height: ITEM_HEIGHT,
		borderBottomWidth: StyleSheet.hairlineWidth,
		borderBottomColor: Colors.border,
	},
	itemSelected: {
		backgroundColor: dynamicColorAlpha("primary", "15"),
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
