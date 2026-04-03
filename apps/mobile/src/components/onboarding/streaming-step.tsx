import { useCallback, useMemo, useState } from "react";
import {
	View,
	Text,
	TextInput,
	Pressable,
	FlatList,
	StyleSheet,
} from "react-native";
import { Image } from "expo-image";
import { Check, Search } from "lucide-react-native";
import { Spinner } from "@/components/spinner";
import { countryName } from "@/lib/region-data";
import { trpc } from "@/lib/trpc";
import {
	Colors,
	fontSize,
	fontFamily,
	spacing,
	radius,
	providerLogoUrl,
} from "@/lib/constants";

interface StreamingStepProps {
	country: string | null;
	selectedProviders: Set<number>;
	onSelectionChange: (providers: Set<number>) => void;
}

interface Provider {
	id: number;
	name: string;
	logoPath: string | null;
}

const NUM_COLUMNS = 4;

export function StreamingStep({
	country,
	selectedProviders,
	onSelectionChange,
}: StreamingStepProps) {
	const { data: providers, isLoading } =
		trpc.movie.getWatchProviders.useQuery();
	const [search, setSearch] = useState("");

	function toggle(id: number) {
		const next = new Set(selectedProviders);
		if (next.has(id)) {
			next.delete(id);
		} else {
			next.add(id);
		}
		onSelectionChange(next);
	}

	const sorted = useMemo(() => {
		const filtered = providers?.filter((p) =>
			p.name.toLowerCase().includes(search.toLowerCase()),
		);
		return filtered?.slice().sort((a, b) => {
			const aSelected = selectedProviders.has(a.id);
			const bSelected = selectedProviders.has(b.id);
			if (aSelected && !bSelected) return -1;
			if (!aSelected && bSelected) return 1;
			return a.name.localeCompare(b.name);
		});
	}, [providers, search, selectedProviders]);

	const renderItem = useCallback(
		({ item: p }: { item: Provider }) => {
			const isSelected = selectedProviders.has(p.id);
			const logo = providerLogoUrl(p.logoPath);
			return (
				<View style={styles.providerCell}>
					<Pressable
						style={styles.providerItem}
						onPress={() => toggle(p.id)}
						accessibilityRole="checkbox"
						accessibilityLabel={p.name}
						accessibilityState={{ checked: isSelected }}
					>
						{logo ? (
							<Image
								source={{ uri: logo }}
								style={styles.providerLogo}
								contentFit="cover"
							/>
						) : (
							<View style={[styles.providerLogo, styles.providerFallback]}>
								<Text style={styles.providerFallbackText}>
									{p.name.charAt(0)}
								</Text>
							</View>
						)}
						<Text style={styles.providerName} numberOfLines={2}>
							{p.name}
						</Text>
						{isSelected && (
							<View style={styles.checkBadge}>
								<Check size={12} color={Colors.primaryForeground} />
							</View>
						)}
					</Pressable>
				</View>
			);
		},
		[selectedProviders],
	);

	return (
		<View style={styles.container}>
			<View style={styles.header}>
				<Text style={styles.title}>Where do you stream?</Text>
				<Text style={styles.subtitle}>
					Pick the services you use in {countryName(country)}.
				</Text>
			</View>

			<View style={styles.searchContainer}>
				<View style={styles.searchBar}>
					<Search size={18} color={Colors.mutedForeground} />
					<TextInput
						style={styles.searchInput}
						value={search}
						onChangeText={setSearch}
						placeholder="Search services"
						placeholderTextColor={Colors.mutedForeground}
						autoCapitalize="none"
						autoCorrect={false}
						accessibilityLabel="Search streaming services"
					/>
				</View>
			</View>

			{isLoading ? (
				<View style={styles.loadingContainer}>
					<Spinner size={32} color={Colors.primary} />
				</View>
			) : (
				<FlatList
					data={sorted ?? []}
					renderItem={renderItem}
					keyExtractor={(p) => String(p.id)}
					numColumns={NUM_COLUMNS}
					contentContainerStyle={styles.gridContainer}
					showsVerticalScrollIndicator={false}
					initialNumToRender={20}
					windowSize={5}
					ListEmptyComponent={
						<View style={styles.emptyContainer}>
							<Text style={styles.emptyText}>
								No services match that search.
							</Text>
						</View>
					}
				/>
			)}
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
	},
	header: {
		paddingHorizontal: spacing[4],
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
	searchContainer: {
		paddingHorizontal: spacing[4],
		paddingTop: spacing[4],
		paddingBottom: spacing[2],
	},
	searchBar: {
		flexDirection: "row",
		alignItems: "center",
		gap: spacing[2],
		backgroundColor: Colors.card,
		borderRadius: radius.lg,
		paddingHorizontal: spacing[3],
		paddingVertical: spacing[2],
		borderWidth: 1,
		borderColor: Colors.border,
	},
	searchInput: {
		flex: 1,
		fontSize: fontSize.base,
		fontFamily: fontFamily.sans,
		color: Colors.foreground,
		paddingVertical: spacing[1],
	},
	loadingContainer: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
	},
	emptyContainer: {
		paddingVertical: spacing[12],
		alignItems: "center",
	},
	emptyText: {
		fontSize: fontSize.sm,
		fontFamily: fontFamily.sans,
		color: Colors.mutedForeground,
		textAlign: "center",
	},
	gridContainer: {
		padding: spacing[4],
		paddingBottom: spacing[8],
	},
	providerCell: {
		flex: 1 / NUM_COLUMNS,
		alignItems: "center",
		marginBottom: spacing[3],
	},
	providerItem: {
		alignItems: "center",
		width: 80,
		gap: spacing[1],
		position: "relative",
	},
	providerLogo: {
		width: 56,
		height: 56,
		borderRadius: radius.lg,
	},
	providerFallback: {
		backgroundColor: Colors.secondary,
		alignItems: "center",
		justifyContent: "center",
	},
	providerFallbackText: {
		fontSize: fontSize.lg,
		fontFamily: fontFamily.sansBold,
		color: Colors.mutedForeground,
	},
	providerName: {
		fontSize: 10,
		fontFamily: fontFamily.sans,
		color: Colors.mutedForeground,
		textAlign: "center",
		lineHeight: 13,
	},
	checkBadge: {
		position: "absolute",
		top: 0,
		right: 8,
		backgroundColor: Colors.primary,
		borderRadius: radius.full,
		width: 20,
		height: 20,
		alignItems: "center",
		justifyContent: "center",
		borderWidth: 2,
		borderColor: Colors.background,
	},
});
