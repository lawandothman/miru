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
import { signIn } from "@/lib/auth";
import { Colors, fontSize, fontFamily, spacing, radius } from "@/lib/constants";

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
							<Text style={styles.googleButtonText}>Continue with Google</Text>
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
