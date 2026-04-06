import { useCallback } from "react";
import {
	View,
	Text,
	Pressable,
	FlatList,
	Alert,
	StyleSheet,
} from "react-native";
import { Stack, useRouter } from "expo-router";
import { Check } from "lucide-react-native";
import { trpc } from "@/lib/trpc";
import { defaultHeaderOptions } from "@/lib/navigation";
import { COUNTRIES, countryFlag } from "@/lib/region-data";
import { Colors, fontSize, fontFamily, spacing, radius } from "@/lib/constants";

const ITEM_HEIGHT = 49;

export default function SettingsRegionScreen() {
	const router = useRouter();
	const utils = trpc.useUtils();
	const { data: state } = trpc.onboarding.getState.useQuery();

	const current = state?.country ?? null;

	const setCountry = trpc.onboarding.setCountry.useMutation({
		onSuccess: () => {
			utils.onboarding.getState.invalidate();
			router.back();
		},
		onError: () => Alert.alert("Error", "Failed to save region"),
	});

	function handleSelect(code: string) {
		if (code !== current) {
			setCountry.mutate({ country: code });
		} else {
			router.back();
		}
	}

	const renderItem = useCallback(
		({ item: c }: { item: (typeof COUNTRIES)[number] }) => {
			const isSelected = current === c.code;
			return (
				<Pressable
					style={[styles.item, isSelected && styles.itemSelected]}
					onPress={() => handleSelect(c.code)}
					disabled={setCountry.isPending}
					accessibilityRole="radio"
					accessibilityState={{ selected: isSelected }}
				>
					<Text style={styles.flag}>{countryFlag(c.code)}</Text>
					<Text style={styles.countryName}>{c.name}</Text>
					{isSelected && <Check size={18} color={Colors.primary} />}
				</Pressable>
			);
		},
		[current, setCountry.isPending],
	);

	return (
		<>
			<Stack.Screen
				options={{
					...defaultHeaderOptions,
					title: "Region",
				}}
			/>
			<View style={styles.container}>
				<Text style={styles.description}>
					This affects which streaming services are shown for movies.
				</Text>
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
		</>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: Colors.background,
		padding: spacing[4],
		gap: spacing[4],
	},
	description: {
		fontSize: fontSize.sm,
		fontFamily: fontFamily.sans,
		color: Colors.mutedForeground,
		lineHeight: 20,
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
