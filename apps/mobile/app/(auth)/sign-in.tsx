import { useState } from "react";
import {
	View,
	Text,
	Pressable,
	StyleSheet,
	ActivityIndicator,
	Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Svg, { Path } from "react-native-svg";
import * as AppleAuthentication from "expo-apple-authentication";
import { signIn } from "@/lib/auth";
import { Colors, fontSize, fontFamily, spacing, radius } from "@/lib/constants";

function AppleIcon({ size = 20 }: { size?: number }) {
	return (
		<Svg
			width={size}
			height={size}
			viewBox="0 0 814.01 999.31"
			fill={Colors.background}
		>
			<Path d="M788.1,340.9c-5.8,4.5-108.2,62.2-108.2,190.5c0,148.4,130.3,200.9,134.2,202.2c-0.6,3.2-20.7,71.9-68.7,141.9c-42.8,61.6-87.5,123.1-155.5,123.1s-85.5-39.5-164-39.5c-76.5,0-103.7,40.8-165.9,40.8s-105.6-57.5-155.5-127.7c-57.8-81.8-104.4-209.4-104.4-330.4c0-194.3,126.4-297.5,250.8-297.5c66.1,0,121.2,43.4,162.7,43.4c39.5,0,101.1-46,176.3-46c28.5,0,130.9,2.6,198.3,99.2ZM554.1,159.4c31.1-36.9,53.1-88.1,53.1-139.3c0-7.1-0.6-14.3-1.9-20.1c-50.6,1.9-110.8,33.7-147.1,75.8c-28.5,32.4-55.1,83.6-55.1,135.5c0,7.8,1.3,15.6,1.9,18.1c3.2,0.6,8.4,1.3,13.6,1.3C462,230.7,521.7,200.3,554.1,159.4z" />
		</Svg>
	);
}

function GoogleIcon({ size = 20 }: { size?: number }) {
	return (
		<Svg width={size} height={size} viewBox="0 0 48 48">
			<Path
				fill="#EA4335"
				d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
			/>
			<Path
				fill="#4285F4"
				d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
			/>
			<Path
				fill="#FBBC05"
				d="M10.53 28.59a14.5 14.5 0 0 1 0-9.18l-7.98-6.19a24.0 24.0 0 0 0 0 21.56l7.98-6.19z"
			/>
			<Path
				fill="#34A853"
				d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
			/>
		</Svg>
	);
}

export default function SignInScreen() {
	const [loading, setLoading] = useState<"google" | "apple" | null>(null);

	async function handleGoogleSignIn() {
		setLoading("google");
		try {
			await signIn.social({
				provider: "google",
				callbackURL: "/(tabs)",
			});
		} catch {
			Alert.alert("Sign in failed", "Something went wrong. Please try again.");
		} finally {
			setLoading(null);
		}
	}

	async function handleAppleSignIn() {
		setLoading("apple");
		try {
			const credential = await AppleAuthentication.signInAsync({
				requestedScopes: [
					AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
					AppleAuthentication.AppleAuthenticationScope.EMAIL,
				],
			});

			if (!credential.identityToken) {
				throw new Error("No identity token returned");
			}

			await signIn.social({
				provider: "apple",
				idToken: {
					token: credential.identityToken,
				},
				callbackURL: "/(tabs)",
			});
		} catch (error) {
			if (
				error instanceof Error &&
				"code" in error &&
				(error as { code: string }).code === "ERR_REQUEST_CANCELED"
			) {
				// User cancelled — do nothing
				return;
			}
			Alert.alert("Sign in failed", "Something went wrong. Please try again.");
		} finally {
			setLoading(null);
		}
	}

	return (
		<SafeAreaView style={styles.container}>
			<View style={styles.content}>
				<View style={styles.branding}>
					<Text style={styles.logo}>Miru</Text>
					<Text style={styles.tagline}>Watch together</Text>
				</View>

				<View style={styles.actions}>
					<Pressable
						style={({ pressed }) => [
							styles.socialButton,
							pressed && styles.pressed,
						]}
						onPress={handleAppleSignIn}
						disabled={loading !== null}
					>
						{loading === "apple" ? (
							<ActivityIndicator color={Colors.background} />
						) : (
							<View style={styles.socialButtonContent}>
								<AppleIcon />
								<Text style={styles.socialButtonText}>Continue with Apple</Text>
							</View>
						)}
					</Pressable>

					<Pressable
						style={({ pressed }) => [
							styles.socialButton,
							pressed && styles.pressed,
						]}
						onPress={handleGoogleSignIn}
						disabled={loading !== null}
					>
						{loading === "google" ? (
							<ActivityIndicator color={Colors.background} />
						) : (
							<View style={styles.socialButtonContent}>
								<GoogleIcon />
								<Text style={styles.socialButtonText}>
									Continue with Google
								</Text>
							</View>
						)}
					</Pressable>
				</View>
			</View>
		</SafeAreaView>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: Colors.background,
	},
	content: {
		flex: 1,
		justifyContent: "space-between",
		paddingHorizontal: spacing[6],
		paddingBottom: spacing[12],
	},
	branding: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
	},
	logo: {
		fontSize: fontSize["5xl"],
		fontFamily: fontFamily.displayBold,
		color: Colors.foreground,
		letterSpacing: -2,
	},
	tagline: {
		fontSize: fontSize.lg,
		fontFamily: fontFamily.sans,
		color: Colors.mutedForeground,
		marginTop: spacing[2],
	},
	actions: {
		gap: spacing[3],
	},
	socialButton: {
		backgroundColor: Colors.foreground,
		paddingVertical: spacing[4],
		borderRadius: radius.lg,
		alignItems: "center",
		justifyContent: "center",
	},
	socialButtonContent: {
		flexDirection: "row",
		alignItems: "center",
		gap: spacing[3],
	},
	pressed: {
		opacity: 0.8,
	},
	socialButtonText: {
		color: Colors.background,
		fontSize: fontSize.lg,
		fontFamily: fontFamily.sansSemibold,
	},
});
