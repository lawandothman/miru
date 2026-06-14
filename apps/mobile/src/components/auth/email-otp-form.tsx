import { useRef, useState } from "react";
import {
	Alert,
	Pressable,
	StyleSheet,
	Text,
	TextInput,
	View,
} from "react-native";
import { OTPInput, type OTPInputRef, type SlotProps } from "input-otp-native";
import * as Sentry from "@sentry/react-native";
import { Spinner } from "@/components/spinner";
import { authClient, signIn } from "@/lib/auth";
import { capture } from "@/lib/analytics";
import { fontFamily, fontSize, radius, spacing } from "@/lib/constants";
import { useThemedStyles, useTheme, type ThemeColors } from "@/lib/theme";

type Step = "email" | "code";

type EmailOtpFormProps = {
	onCancel: () => void;
};

export function EmailOtpForm({ onCancel }: EmailOtpFormProps) {
	const styles = useThemedStyles(createStyles);
	const { colors } = useTheme();
	const [step, setStep] = useState<Step>("email");
	const [email, setEmail] = useState("");
	const [pending, setPending] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const otpRef = useRef<OTPInputRef>(null);

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

	async function handleVerify(otpCode: string) {
		setError(null);
		setPending(true);
		try {
			const result = await signIn.emailOtp({ email, otp: otpCode });
			if (result.error) {
				setError(result.error.message ?? "Invalid code. Try again.");
				otpRef.current?.clear();
				return;
			}
			capture("signed_in", { method: "email" });
		} catch (e) {
			Sentry.captureException(e, {
				tags: { flow: "sign-in", provider: "email" },
			});
			Alert.alert("Sign in failed", "Something went wrong. Please try again.");
			otpRef.current?.clear();
		} finally {
			setPending(false);
		}
	}

	return (
		<View style={styles.container}>
			{step === "email" ? (
				<>
					<TextInput
						style={styles.input}
						value={email}
						onChangeText={setEmail}
						placeholder="you@example.com"
						placeholderTextColor={colors.mutedForeground}
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
							<Spinner size={20} color={colors.background} />
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
					<OTPInput
						ref={otpRef}
						maxLength={6}
						onComplete={handleVerify}
						autoFocus
						editable={!pending}
						containerStyle={styles.otpContainer}
						render={({ slots }) => (
							<View style={styles.slots}>
								{slots.map((slot, index) => (
									// oxlint-disable-next-line react/no-array-index-key -- slots have fixed positions
									<Slot key={index} {...slot} />
								))}
							</View>
						)}
					/>
					{pending ? (
						<View style={styles.pendingRow}>
							<Spinner size={20} color={colors.mutedForeground} />
						</View>
					) : null}
				</>
			)}

			{error ? <Text style={styles.errorText}>{error}</Text> : null}

			<Pressable
				onPress={() => {
					if (step === "code") {
						setStep("email");
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
		</View>
	);
}

function Slot({ char, isActive }: SlotProps) {
	const styles = useThemedStyles(createStyles);
	return (
		<View style={[styles.slot, isActive && styles.slotActive]}>
			<Text style={styles.slotChar}>{char ?? ""}</Text>
		</View>
	);
}

const createStyles = (colors: ThemeColors) =>
	StyleSheet.create({
		container: {
			gap: spacing[3],
		},
		input: {
			backgroundColor: colors.muted,
			borderRadius: radius.lg,
			color: colors.foreground,
			fontFamily: fontFamily.sans,
			fontSize: fontSize.lg,
			paddingHorizontal: spacing[4],
			paddingVertical: spacing[4],
		},
		otpContainer: {
			alignItems: "center",
		},
		slots: {
			flexDirection: "row",
			gap: spacing[2],
		},
		slot: {
			width: 48,
			height: 56,
			borderRadius: radius.lg,
			backgroundColor: colors.muted,
			alignItems: "center",
			justifyContent: "center",
			borderWidth: 2,
			borderColor: "transparent",
		},
		slotActive: {
			borderColor: colors.foreground,
		},
		slotChar: {
			color: colors.foreground,
			fontFamily: fontFamily.sansSemibold,
			fontSize: fontSize["2xl"],
		},
		primaryButton: {
			alignItems: "center",
			backgroundColor: colors.foreground,
			borderRadius: radius.lg,
			justifyContent: "center",
			paddingVertical: spacing[4],
		},
		primaryButtonText: {
			color: colors.background,
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
			color: colors.mutedForeground,
			fontFamily: fontFamily.sans,
			fontSize: fontSize.sm,
			textAlign: "center",
		},
		pendingRow: {
			alignItems: "center",
			paddingVertical: spacing[2],
		},
		errorText: {
			color: colors.destructive,
			fontFamily: fontFamily.sans,
			fontSize: fontSize.sm,
			textAlign: "center",
		},
		linkText: {
			color: colors.mutedForeground,
			fontFamily: fontFamily.sans,
			fontSize: fontSize.sm,
			paddingVertical: spacing[2],
			textAlign: "center",
		},
	});
