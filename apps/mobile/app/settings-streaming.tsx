import { useState } from "react";
import {
	View,
	Text,
	TextInput,
	Pressable,
	ScrollView,
	ActivityIndicator,
	Alert,
	StyleSheet,
} from "react-native";
import { Stack, useRouter } from "expo-router";
import { Image } from "expo-image";
import { Check, Search } from "lucide-react-native";
import { trpc } from "@/lib/trpc";
import { useToggleSet } from "@/hooks/use-toggle-set";
import { defaultHeaderOptions } from "@/lib/navigation";
import {
	Colors,
	fontSize,
	fontFamily,
	spacing,
	radius,
	providerLogoUrl,
} from "@/lib/constants";

export default function SettingsStreamingScreen() {
	const router = useRouter();
	const utils = trpc.useUtils();
	const { data: providers, isLoading: providersLoading } =
		trpc.movie.getWatchProviders.useQuery();
	const { data: state, isLoading: stateLoading } =
		trpc.onboarding.getState.useQuery();

	const { selected, toggle, hasChanged } = useToggleSet(state?.providerIds);
	const [search, setSearch] = useState("");

	const setServices = trpc.onboarding.setStreamingServices.useMutation({
		onSuccess: () => {
			utils.onboarding.getState.invalidate();
			router.back();
		},
		onError: () => Alert.alert("Error", "Failed to save streaming services"),
	});

	const isLoading = providersLoading || stateLoading;
	const hasChanges = hasChanged(state?.providerIds);

	const filtered = providers?.filter((p) =>
		p.name.toLowerCase().includes(search.toLowerCase()),
	);

	// Sort: selected first, then alphabetical
	const sorted = filtered?.slice().sort((a, b) => {
		const aSelected = selected.has(a.id);
		const bSelected = selected.has(b.id);
		if (aSelected && !bSelected) return -1;
		if (!aSelected && bSelected) return 1;
		return a.name.localeCompare(b.name);
	});

	return (
		<>
			<Stack.Screen
				options={{
					...defaultHeaderOptions,
					title: "Streaming Services",
					headerRight: () =>
						hasChanges ? (
							<Pressable
								onPress={() =>
									setServices.mutate({ providerIds: Array.from(selected) })
								}
								disabled={setServices.isPending}
							>
								{setServices.isPending ? (
									<ActivityIndicator color={Colors.primary} size="small" />
								) : (
									<Text style={styles.saveHeaderText}>Save</Text>
								)}
							</Pressable>
						) : null,
				}}
			/>
			<View style={styles.container}>
				{/* Search bar */}
				<View style={styles.searchContainer}>
					<View style={styles.searchBar}>
						<Search size={18} color={Colors.mutedForeground} />
						<TextInput
							style={styles.searchInput}
							value={search}
							onChangeText={setSearch}
							placeholder="Search services..."
							placeholderTextColor={Colors.mutedForeground}
							autoCapitalize="none"
							autoCorrect={false}
						/>
					</View>
				</View>

				{isLoading ? (
					<View style={styles.loadingContainer}>
						<ActivityIndicator color={Colors.primary} size="large" />
					</View>
				) : (
					<ScrollView
						contentContainerStyle={styles.content}
						showsVerticalScrollIndicator={false}
					>
						<View style={styles.grid}>
							{sorted?.map((p) => {
								const isSelected = selected.has(p.id);
								const logo = providerLogoUrl(p.logoPath);
								return (
									<Pressable
										key={p.id}
										style={styles.providerItem}
										onPress={() => toggle(p.id)}
									>
										{logo ? (
											<Image
												source={{ uri: logo }}
												style={styles.providerLogo}
												contentFit="cover"
											/>
										) : (
											<View
												style={[styles.providerLogo, styles.providerFallback]}
											>
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
								);
							})}
						</View>
					</ScrollView>
				)}
			</View>
		</>
	);
}

const ITEM_SIZE = 80;

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: Colors.background,
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
	content: {
		padding: spacing[4],
		paddingBottom: spacing[12],
	},
	grid: {
		flexDirection: "row",
		flexWrap: "wrap",
		gap: spacing[3],
	},
	providerItem: {
		alignItems: "center",
		width: ITEM_SIZE,
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
	saveHeaderText: {
		fontSize: fontSize.base,
		fontFamily: fontFamily.sansSemibold,
		color: Colors.primary,
	},
});
