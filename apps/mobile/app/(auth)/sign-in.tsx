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
import { signIn } from "@/lib/auth";
import { Colors, fontSize, fontFamily, spacing, radius } from "@/lib/constants";

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
	const [loading, setLoading] = useState(false);

	async function handleGoogleSignIn() {
		setLoading(true);
		try {
			await signIn.social({
				provider: "google",
				callbackURL: "/(tabs)",
			});
		} catch {
			Alert.alert("Sign in failed", "Something went wrong. Please try again.");
		} finally {
			setLoading(false);
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
							styles.googleButton,
							pressed && styles.pressed,
						]}
						onPress={handleGoogleSignIn}
						disabled={loading}
					>
						{loading ? (
							<ActivityIndicator color={Colors.background} />
						) : (
							<View style={styles.googleButtonContent}>
							<GoogleIcon />
							<Text style={styles.googleButtonText}>Continue with Google</Text>
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
	googleButton: {
		backgroundColor: Colors.foreground,
		paddingVertical: spacing[4],
		borderRadius: radius.lg,
		alignItems: "center",
		justifyContent: "center",
	},
	googleButtonContent: {
		flexDirection: "row",
		alignItems: "center",
		gap: spacing[3],
	},
	pressed: {
		opacity: 0.8,
	},
	googleButtonText: {
		color: Colors.background,
		fontSize: fontSize.lg,
		fontFamily: fontFamily.sansSemibold,
	},
});
