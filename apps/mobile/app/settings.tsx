import {
	View,
	Text,
	Pressable,
	ScrollView,
	Alert,
	StyleSheet,
} from "react-native";
import { Stack } from "expo-router";
import { useQueryClient } from "@tanstack/react-query";
import {
	Bell,
	User,
	Clapperboard,
	Tv,
	Globe,
	LogOut,
	Trash2,
} from "lucide-react-native";
import { authClient, useSession, signOut } from "@/lib/auth";
import { getDevicePushToken } from "@/lib/notifications";
import { trpc } from "@/lib/trpc";
import { queryPersister } from "@/lib/trpc-provider";
import { capture } from "@/lib/analytics";
import { useDefaultHeaderOptions } from "@/lib/navigation";
import { AvatarUpload } from "@/components/avatar-upload";
import { SettingsSection } from "@/components/settings/section";
import { EditNameForm } from "@/components/settings/edit-name-form";
import { GenreSummary } from "@/components/settings/genre-summary";
import { StreamingSummary } from "@/components/settings/streaming-summary";
import { RegionSummary } from "@/components/settings/region-summary";
import { NotificationPreferences } from "@/components/settings/notification-preferences";
import { Colors, fontSize, fontFamily, spacing, radius } from "@/lib/constants";

export default function SettingsScreen() {
	const { data: session } = useSession();
	const headerOptions = useDefaultHeaderOptions();

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
					...headerOptions,
					title: "Settings",
				}}
			/>
			<ScrollView
				style={styles.container}
				contentContainerStyle={styles.content}
				showsVerticalScrollIndicator={false}
			>
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

				<SettingsSection title="Profile" icon={User}>
					<EditNameForm
						key={session?.user?.name ?? ""}
						currentName={session?.user?.name ?? ""}
					/>
				</SettingsSection>

				<SettingsSection title="Genre Preferences" icon={Clapperboard}>
					<GenreSummary />
				</SettingsSection>

				<SettingsSection title="Streaming Services" icon={Tv}>
					<StreamingSummary />
				</SettingsSection>

				<SettingsSection title="Region" icon={Globe}>
					<RegionSummary />
				</SettingsSection>

				<SettingsSection title="Notifications" icon={Bell}>
					<NotificationPreferences />
				</SettingsSection>

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
								await queryPersister.removeClient();
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
												await queryPersister.removeClient();
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
	pressed: {
		opacity: 0.7,
	},
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
