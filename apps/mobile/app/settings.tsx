import { useState, useEffect } from "react";
import {
	View,
	Text,
	TextInput,
	Pressable,
	ScrollView,
	Switch,
	Alert,
	StyleSheet,
	Platform,
} from "react-native";
import { Stack, useRouter } from "expo-router";
import * as Notifications from "expo-notifications";
import { Image } from "expo-image";
import { useQueryClient } from "@tanstack/react-query";
import {
	Bell,
	ChevronRight,
	ChevronDown,
	Check,
	User,
	Clapperboard,
	Tv,
	Globe,
	LogOut,
	Trash2,
} from "lucide-react-native";
import { authClient, useSession, signOut } from "@/lib/auth";
import {
	getDevicePushToken,
	getNotificationPermissionsStatus,
} from "@/lib/notifications";
import { trpc } from "@/lib/trpc";
import { capture } from "@/lib/analytics";
import { defaultHeaderOptions } from "@/lib/navigation";
import { AvatarUpload } from "@/components/avatar-upload";
import { Spinner } from "@/components/spinner";
import {
	Colors,
	fontSize,
	fontFamily,
	spacing,
	radius,
	providerLogoUrl,
} from "@/lib/constants";
import { COUNTRIES, countryFlag } from "@/lib/region-data";

export default function SettingsScreen() {
	const { data: session } = useSession();

	const queryClient = useQueryClient();
	const unregisterPushToken =
		trpc.notification.unregisterPushToken.useMutation();

	async function unregisterCurrentPushToken() {
		try {
			const result = await getDevicePushToken({ promptForPermission: false });

			if (!result.token) {
				return;
			}

			await unregisterPushToken.mutateAsync({ token: result.token });
		} catch {
			// Ignore push token cleanup failures during account actions.
		}
	}

	return (
		<>
			<Stack.Screen
				options={{
					...defaultHeaderOptions,
					title: "Settings",
				}}
			/>
			<ScrollView
				style={styles.container}
				contentContainerStyle={styles.content}
				showsVerticalScrollIndicator={false}
			>
				{/* Profile header */}
				<View style={styles.profileHeader}>
					<AvatarUpload
						imageUrl={session?.user?.image}
						name={session?.user?.name}
						size={64}
					/>
					<View style={styles.profileInfo}>
						<Text style={styles.profileName}>{session?.user?.name}</Text>
						<Text style={styles.profileEmail}>{session?.user?.email}</Text>
					</View>
				</View>

				{/* Display name */}
				<SettingsSection title="Profile" icon={User}>
					<EditNameForm currentName={session?.user?.name ?? ""} />
				</SettingsSection>

				{/* Genre preferences */}
				<SettingsSection title="Genre Preferences" icon={Clapperboard}>
					<GenreSummary />
				</SettingsSection>

				{/* Streaming services */}
				<SettingsSection title="Streaming Services" icon={Tv}>
					<StreamingSummary />
				</SettingsSection>

				{/* Region */}
				<SettingsSection title="Region" icon={Globe}>
					<RegionPicker />
				</SettingsSection>

				{/* Notifications */}
				<SettingsSection title="Notifications" icon={Bell}>
					<NotificationPreferences />
				</SettingsSection>

				{/* Account / Danger zone */}
				<SettingsSection title="Account">
					<Pressable
						style={({ pressed }) => [
							styles.actionRow,
							pressed && styles.pressed,
						]}
						accessibilityRole="button"
						accessibilityLabel="Sign out"
						onPress={async () => {
							try {
								await unregisterCurrentPushToken();
								await signOut();
								capture("signed_out", {});
								queryClient.clear();
							} catch {
								Alert.alert("Error", "Failed to sign out. Please try again.");
							}
						}}
					>
						<LogOut size={18} color={Colors.foreground} />
						<Text style={styles.signOutText}>Sign out</Text>
					</Pressable>
					<View style={styles.separator} />
					<Pressable
						style={({ pressed }) => [
							styles.actionRow,
							pressed && styles.pressed,
						]}
						accessibilityRole="button"
						accessibilityLabel="Delete account"
						onPress={() => {
							Alert.alert(
								"Delete account",
								"This will permanently delete your account, watchlist, watch history, and all associated data. This action cannot be undone.",
								[
									{ text: "Cancel", style: "cancel" },
									{
										text: "Delete",
										style: "destructive",
										onPress: async () => {
											try {
												await unregisterCurrentPushToken();
												await authClient.deleteUser({ callbackURL: "/" });
												queryClient.clear();
											} catch {
												Alert.alert(
													"Error",
													"Failed to delete account. Please try again.",
												);
											}
										},
									},
								],
							);
						}}
					>
						<Trash2 size={18} color={Colors.destructive} />
						<Text style={styles.deleteText}>Delete account</Text>
					</Pressable>
				</SettingsSection>
			</ScrollView>
		</>
	);
}

/* ── Section wrapper ─────────────────────────────────────────────── */

function SettingsSection({
	title,
	icon: Icon,
	children,
}: {
	title: string;
	icon?: React.ComponentType<{ size: number; color: string }>;
	children: React.ReactNode;
}) {
	return (
		<View style={styles.section}>
			<View style={styles.sectionHeader}>
				{Icon && <Icon size={14} color={Colors.mutedForeground} />}
				<Text style={styles.sectionTitle}>{title}</Text>
			</View>
			<View style={styles.sectionCard}>{children}</View>
		</View>
	);
}

/* ── Edit name ───────────────────────────────────────────────────── */

function EditNameForm({ currentName }: { currentName: string }) {
	const [name, setName] = useState(currentName);
	const [isPending, setIsPending] = useState(false);

	useEffect(() => {
		setName(currentName);
	}, [currentName]);

	const hasChanged = name.trim() !== currentName && name.trim().length > 0;

	async function handleSave() {
		setIsPending(true);
		try {
			await authClient.updateUser({ name: name.trim() });
			Alert.alert("Profile updated");
		} catch {
			Alert.alert("Error", "Failed to update profile");
		} finally {
			setIsPending(false);
		}
	}

	return (
		<View style={styles.nameRow}>
			<TextInput
				style={styles.textInput}
				value={name}
				onChangeText={setName}
				placeholder="Your name"
				placeholderTextColor={Colors.mutedForeground}
				returnKeyType="done"
				onSubmitEditing={() => hasChanged && handleSave()}
			/>
			{hasChanged && (
				<Pressable
					style={({ pressed }) => [
						styles.saveButton,
						pressed && styles.pressed,
					]}
					onPress={handleSave}
					disabled={isPending}
				>
					{isPending ? (
						<Spinner size={16} color={Colors.primaryForeground} />
					) : (
						<Text style={styles.saveButtonText}>Save</Text>
					)}
				</Pressable>
			)}
		</View>
	);
}

/* ── Genre summary (tap to edit) ─────────────────────────────────── */

function GenreSummary() {
	const router = useRouter();
	const { data: genres } = trpc.movie.getGenres.useQuery();
	const { data: state, isLoading } = trpc.onboarding.getState.useQuery();

	if (isLoading) {
		return <Spinner />;
	}

	const selectedGenres =
		genres?.filter((g) => state?.genreIds.includes(g.id)) ?? [];

	return (
		<Pressable
			style={({ pressed }) => [styles.summaryRow, pressed && styles.pressed]}
			onPress={() => router.push("/settings-genres")}
		>
			<View style={styles.summaryContent}>
				{selectedGenres.length > 0 ? (
					<View style={styles.chipPreview}>
						{selectedGenres.slice(0, 4).map((g) => (
							<View key={g.id} style={styles.chipSmall}>
								<Text style={styles.chipSmallText}>{g.name}</Text>
							</View>
						))}
						{selectedGenres.length > 4 && (
							<Text style={styles.moreText}>
								+{selectedGenres.length - 4} more
							</Text>
						)}
					</View>
				) : (
					<Text style={styles.placeholderText}>No genres selected</Text>
				)}
			</View>
			<ChevronRight size={18} color={Colors.mutedForeground} />
		</Pressable>
	);
}

/* ── Streaming summary (tap to edit) ─────────────────────────────── */

function StreamingSummary() {
	const router = useRouter();
	const { data: providers } = trpc.movie.getWatchProviders.useQuery();
	const { data: state, isLoading } = trpc.onboarding.getState.useQuery();

	if (isLoading) {
		return <Spinner />;
	}

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

/* ── Region picker ───────────────────────────────────────────────── */

function RegionPicker() {
	const { data: state, isLoading } = trpc.onboarding.getState.useQuery();
	const [editedCountry, setEditedCountry] = useState<string | null>(null);
	const country = editedCountry ?? state?.country ?? "";
	const [expanded, setExpanded] = useState(false);

	const setCountryMut = trpc.onboarding.setCountry.useMutation({
		onSuccess: () => Alert.alert("Region saved"),
		onError: () => Alert.alert("Error", "Failed to save region"),
	});

	if (isLoading) {
		return <Spinner />;
	}

	const current = COUNTRIES.find((c) => c.code === country);

	return (
		<View>
			<Pressable
				style={styles.regionTrigger}
				onPress={() => setExpanded(!expanded)}
			>
				<Text style={styles.regionTriggerText}>
					{current
						? `${countryFlag(current.code)} ${current.name}`
						: "Select a region"}
				</Text>
				<ChevronDown
					size={16}
					color={Colors.mutedForeground}
					style={expanded ? { transform: [{ rotate: "180deg" }] } : undefined}
				/>
			</Pressable>
			<Text style={styles.regionHint}>
				This affects which streaming services are shown for movies.
			</Text>
			{expanded && (
				<View style={styles.regionList}>
					{COUNTRIES.map((c) => {
						const isSelected = country === c.code;
						return (
							<Pressable
								key={c.code}
								style={[
									styles.regionItem,
									isSelected && styles.regionItemSelected,
								]}
								onPress={() => {
									setEditedCountry(c.code);
									setExpanded(false);
									if (c.code !== (state?.country ?? "")) {
										setCountryMut.mutate({ country: c.code });
									}
								}}
							>
								<Text style={styles.regionItemText}>
									{countryFlag(c.code)} {c.name}
								</Text>
								{isSelected && <Check size={16} color={Colors.primary} />}
							</Pressable>
						);
					})}
				</View>
			)}
		</View>
	);
}

function NotificationPreferences() {
	const utils = trpc.useUtils();
	const { data: preferences, isLoading } =
		trpc.notification.getPreferences.useQuery();
	const registerPushToken = trpc.notification.registerPushToken.useMutation();
	const setPreferences = trpc.notification.setPreferences.useMutation({
		onSuccess: async () => {
			await utils.notification.getPreferences.invalidate();
		},
	});
	const [systemStatus, setSystemStatus] =
		useState<Notifications.PermissionStatus | null>(null);
	const [isUpdating, setIsUpdating] = useState(false);

	useEffect(() => {
		let cancelled = false;

		async function loadPermissionStatus() {
			const status = await getNotificationPermissionsStatus();

			if (!cancelled) {
				setSystemStatus(status);
			}
		}

		loadPermissionStatus().catch(() => undefined);

		return () => {
			cancelled = true;
		};
	}, []);

	async function handleToggle(nextValue: boolean) {
		if (isUpdating) {
			return;
		}

		setIsUpdating(true);

		try {
			if (!nextValue) {
				await setPreferences.mutateAsync({ enabled: false });
				return;
			}

			const result = await getDevicePushToken({ promptForPermission: true });
			setSystemStatus(result.status);

			if (result.error === "physical-device-required") {
				Alert.alert(
					"Physical device required",
					"Push notifications only work on a real device.",
				);
				return;
			}

			if (!result.token) {
				Alert.alert(
					"Notifications unavailable",
					"Enable notification permissions for Miru in your device settings to turn push notifications on.",
				);
				return;
			}

			await registerPushToken.mutateAsync({
				platform: Platform.OS === "ios" ? "ios" : "android",
				token: result.token,
			});
			await setPreferences.mutateAsync({ enabled: true });
		} catch {
			Alert.alert(
				"Error",
				"Failed to update notification preferences. Please try again.",
			);
		} finally {
			setIsUpdating(false);
		}
	}

	const enabled = preferences?.enabled ?? false;
	const statusText =
		systemStatus === Notifications.PermissionStatus.GRANTED
			? "Allowed in system settings"
			: systemStatus === Notifications.PermissionStatus.DENIED
				? "Blocked in system settings"
				: "System permission not requested yet";

	if (isLoading) {
		return <Spinner />;
	}

	return (
		<View style={styles.notificationBlock}>
			<View style={styles.notificationRow}>
				<View style={styles.notificationCopy}>
					<Text style={styles.notificationTitle}>Push notifications</Text>
					<Text style={styles.notificationHint}>
						Turn push notifications on or off for your account.
					</Text>
				</View>
				<Switch
					value={enabled}
					onValueChange={handleToggle}
					disabled={isUpdating}
					trackColor={{
						false: Colors.secondary,
						true: `${Colors.primary}80`,
					}}
					thumbColor={enabled ? Colors.primary : Colors.mutedForeground}
					accessibilityLabel="Push notifications"
					accessibilityRole="switch"
				/>
			</View>
			<Text style={styles.systemStatusText}>{statusText}</Text>
		</View>
	);
}

/* ── Styles ──────────────────────────────────────────────────────── */

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: Colors.background,
	},
	content: {
		padding: spacing[4],
		paddingTop: spacing[6],
		paddingBottom: spacing[12],
		gap: spacing[8],
	},

	// Profile header
	profileHeader: {
		flexDirection: "row",
		alignItems: "center",
		gap: spacing[4],
		backgroundColor: Colors.card,
		borderRadius: radius.xl,
		padding: spacing[5],
	},
	profileInfo: {
		flex: 1,
	},
	profileName: {
		fontSize: fontSize.lg,
		fontFamily: fontFamily.displaySemibold,
		color: Colors.foreground,
	},
	profileEmail: {
		fontSize: fontSize.sm,
		fontFamily: fontFamily.sans,
		color: Colors.mutedForeground,
		marginTop: 2,
	},

	// Sections
	section: {
		gap: spacing[2],
	},
	sectionHeader: {
		flexDirection: "row",
		alignItems: "center",
		gap: spacing[2],
		paddingHorizontal: spacing[1],
	},
	sectionTitle: {
		fontSize: fontSize.xs,
		fontFamily: fontFamily.displaySemibold,
		color: Colors.mutedForeground,
		textTransform: "uppercase",
		letterSpacing: 1.5,
	},
	sectionCard: {
		backgroundColor: Colors.card,
		borderRadius: radius.xl,
		padding: spacing[4],
	},

	// Edit name
	nameRow: {
		flexDirection: "row",
		gap: spacing[3],
		alignItems: "center",
	},
	textInput: {
		flex: 1,
		backgroundColor: Colors.secondary,
		borderRadius: radius.lg,
		paddingHorizontal: spacing[3],
		paddingVertical: spacing[2],
		fontSize: fontSize.base,
		fontFamily: fontFamily.sans,
		color: Colors.foreground,
	},
	saveButton: {
		backgroundColor: Colors.primary,
		borderRadius: radius.lg,
		paddingHorizontal: spacing[4],
		paddingVertical: spacing[2],
		alignItems: "center",
		justifyContent: "center",
	},
	saveButtonText: {
		fontSize: fontSize.sm,
		fontFamily: fontFamily.sansSemibold,
		color: Colors.primaryForeground,
	},
	pressed: {
		opacity: 0.7,
	},

	// Summary rows (genres, streaming)
	summaryRow: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
		gap: spacing[3],
	},
	summaryContent: {
		flex: 1,
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

	// Genre chip preview
	chipPreview: {
		flexDirection: "row",
		flexWrap: "wrap",
		gap: spacing[2],
		alignItems: "center",
	},
	chipSmall: {
		paddingHorizontal: spacing[2],
		paddingVertical: spacing[1],
		borderRadius: radius.full,
		backgroundColor: `${Colors.primary}20`,
	},
	chipSmallText: {
		fontSize: fontSize.xs,
		fontFamily: fontFamily.sansMedium,
		color: Colors.primary,
	},

	// Streaming logo preview
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

	// Region
	regionTrigger: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
		backgroundColor: Colors.secondary,
		borderRadius: radius.lg,
		paddingHorizontal: spacing[3],
		paddingVertical: spacing[3],
	},
	regionTriggerText: {
		fontSize: fontSize.base,
		fontFamily: fontFamily.sans,
		color: Colors.foreground,
	},
	regionHint: {
		fontSize: fontSize.xs,
		fontFamily: fontFamily.sans,
		color: Colors.mutedForeground,
		marginTop: spacing[2],
	},
	regionList: {
		marginTop: spacing[2],
		backgroundColor: Colors.secondary,
		borderRadius: radius.lg,
		overflow: "hidden",
	},
	regionItem: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
		paddingHorizontal: spacing[3],
		paddingVertical: spacing[3],
		borderBottomWidth: StyleSheet.hairlineWidth,
		borderBottomColor: Colors.border,
	},
	regionItemSelected: {
		backgroundColor: `${Colors.primary}15`,
	},
	regionItemText: {
		fontSize: fontSize.base,
		fontFamily: fontFamily.sans,
		color: Colors.foreground,
	},

	// Notifications
	notificationBlock: {
		gap: spacing[2],
	},
	notificationRow: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
		gap: spacing[4],
	},
	notificationCopy: {
		flex: 1,
		gap: spacing[1],
	},
	notificationTitle: {
		fontSize: fontSize.base,
		fontFamily: fontFamily.sansMedium,
		color: Colors.foreground,
	},
	notificationHint: {
		fontSize: fontSize.sm,
		fontFamily: fontFamily.sans,
		color: Colors.mutedForeground,
	},
	systemStatusText: {
		fontSize: fontSize.xs,
		fontFamily: fontFamily.sans,
		color: Colors.mutedForeground,
	},

	// Account actions
	actionRow: {
		flexDirection: "row",
		alignItems: "center",
		gap: spacing[3],
		paddingVertical: spacing[3],
	},
	separator: {
		height: StyleSheet.hairlineWidth,
		backgroundColor: Colors.border,
	},
	signOutText: {
		fontSize: fontSize.base,
		fontFamily: fontFamily.sansMedium,
		color: Colors.foreground,
	},
	deleteText: {
		fontSize: fontSize.base,
		fontFamily: fontFamily.sansMedium,
		color: Colors.destructive,
	},
});
