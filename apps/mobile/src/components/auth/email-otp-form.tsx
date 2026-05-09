import { useState } from "react";
import {
	Alert,
	KeyboardAvoidingView,
	Platform,
	Pressable,
	StyleSheet,
	Text,
	TextInput,
} from "react-native";
import * as Sentry from "@sentry/react-native";
import { Spinner } from "@/components/spinner";
import { authClient, signIn } from "@/lib/auth";
import { capture } from "@/lib/analytics";
import { Colors, fontFamily, fontSize, radius, spacing } from "@/lib/constants";

type Step = "email" | "code";

type EmailOtpFormProps = {
	onCancel: () => void;
};

export function EmailOtpForm({ onCancel }: EmailOtpFormProps) {
	const [step, setStep] = useState<Step>("email");
	const [email, setEmail] = useState("");
	const [code, setCode] = useState("");
	const [pending, setPending] = useState(false);
	const [error, setError] = useState<string | null>(null);

	async function handleSendCode() {
		setError(null);
		setPending(true);
		try {
			const result = await authClient.emailOtp.sendVerificationOtp({
				email,
				type: "sign-in",
			});
			if (result.error) {
				setError(
					result.error.message ?? "Could not send code. Please try again.",
				);
				return;
			}
			setStep("code");
		} catch (e) {
			Sentry.captureException(e, {
				tags: { flow: "sign-in", provider: "email" },
			});
			Alert.alert("Sign in failed", "Something went wrong. Please try again.");
		} finally {
			setPending(false);
		}
	}

	async function handleVerify() {
		setError(null);
		setPending(true);
		try {
			const result = await signIn.emailOtp({ email, otp: code });
			if (result.error) {
				setError(result.error.message ?? "Invalid code. Try again.");
				return;
			}
			capture("signed_in", { method: "email" });
		} catch (e) {
			Sentry.captureException(e, {
				tags: { flow: "sign-in", provider: "email" },
			});
			Alert.alert("Sign in failed", "Something went wrong. Please try again.");
		} finally {
			setPending(false);
		}
	}

	return (
		<KeyboardAvoidingView
			behavior={Platform.OS === "ios" ? "padding" : undefined}
			style={styles.container}
		>
			{step === "email" ? (
				<>
					<TextInput
						style={styles.input}
						value={email}
						onChangeText={setEmail}
						placeholder="you@example.com"
						placeholderTextColor={Colors.mutedForeground}
						keyboardType="email-address"
						autoCapitalize="none"
						autoCorrect={false}
						autoComplete="email"
						textContentType="emailAddress"
						returnKeyType="send"
						onSubmitEditing={handleSendCode}
						editable={!pending}
					/>
					<Pressable
						style={({ pressed }) => [
							styles.primaryButton,
							pressed && styles.pressed,
							(pending || email.length === 0) && styles.disabled,
						]}
						onPress={handleSendCode}
						disabled={pending || email.length === 0}
					>
						{pending ? (
							<Spinner size={20} color={Colors.background} />
						) : (
							<Text style={styles.primaryButtonText}>Send code</Text>
						)}
					</Pressable>
				</>
			) : (
				<>
					<Text style={styles.helperText}>
						Enter the 6-digit code we sent to {email}
					</Text>
					<TextInput
						style={[styles.input, styles.codeInput]}
						value={code}
						onChangeText={(text) =>
							setCode(text.replace(/\D/g, "").slice(0, 6))
						}
						placeholder="123456"
						placeholderTextColor={Colors.mutedForeground}
						keyboardType="number-pad"
						autoComplete="one-time-code"
						textContentType="oneTimeCode"
						maxLength={6}
						autoFocus
						editable={!pending}
						onSubmitEditing={handleVerify}
					/>
					<Pressable
						style={({ pressed }) => [
							styles.primaryButton,
							pressed && styles.pressed,
							(pending || code.length !== 6) && styles.disabled,
						]}
						onPress={handleVerify}
						disabled={pending || code.length !== 6}
					>
						{pending ? (
							<Spinner size={20} color={Colors.background} />
						) : (
							<Text style={styles.primaryButtonText}>Verify and sign in</Text>
						)}
					</Pressable>
				</>
			)}

			{error ? <Text style={styles.errorText}>{error}</Text> : null}

			<Pressable
				onPress={() => {
					if (step === "code") {
						setStep("email");
						setCode("");
						setError(null);
						return;
					}
					onCancel();
				}}
				disabled={pending}
			>
				<Text style={styles.linkText}>
					{step === "code" ? "Use a different email" : "Back"}
				</Text>
			</Pressable>
		</KeyboardAvoidingView>
	);
}

const styles = StyleSheet.create({
	container: {
		gap: spacing[3],
	},
	input: {
		backgroundColor: Colors.muted,
		borderRadius: radius.lg,
		color: Colors.foreground,
		fontFamily: fontFamily.sans,
		fontSize: fontSize.lg,
		paddingHorizontal: spacing[4],
		paddingVertical: spacing[4],
	},
	codeInput: {
		fontFamily: fontFamily.sansSemibold,
		fontSize: fontSize["2xl"],
		letterSpacing: 8,
		textAlign: "center",
	},
	primaryButton: {
		alignItems: "center",
		backgroundColor: Colors.foreground,
		borderRadius: radius.lg,
		justifyContent: "center",
		paddingVertical: spacing[4],
	},
	primaryButtonText: {
		color: Colors.background,
		fontFamily: fontFamily.sansSemibold,
		fontSize: fontSize.lg,
	},
	pressed: {
		opacity: 0.8,
	},
	disabled: {
		opacity: 0.5,
	},
	helperText: {
		color: Colors.mutedForeground,
		fontFamily: fontFamily.sans,
		fontSize: fontSize.sm,
		textAlign: "center",
	},
	errorText: {
		color: Colors.destructive,
		fontFamily: fontFamily.sans,
		fontSize: fontSize.sm,
		textAlign: "center",
	},
	linkText: {
		color: Colors.mutedForeground,
		fontFamily: fontFamily.sans,
		fontSize: fontSize.sm,
		paddingVertical: spacing[2],
		textAlign: "center",
	},
});
