"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { authClient, signIn } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
	InputOTP,
	InputOTPGroup,
	InputOTPSeparator,
	InputOTPSlot,
} from "@/components/ui/input-otp";
import { Spinner } from "@/components/ui/spinner";
import { capture } from "@/lib/analytics";

const emailSchema = z.email("Enter a valid email address");

type Step = "email" | "code";

export function EmailOtpForm() {
	const router = useRouter();
	const [step, setStep] = useState<Step>("email");
	const [email, setEmail] = useState("");
	const [code, setCode] = useState("");
	const [error, setError] = useState<string | null>(null);
	const [pending, setPending] = useState(false);

	async function handleSendCode(e: React.FormEvent) {
		e.preventDefault();
		setError(null);
		const parsed = emailSchema.safeParse(email);
		if (!parsed.success) {
			setError(parsed.error.issues[0]?.message ?? "Invalid email");
			return;
		}
		setPending(true);
		const result = await authClient.emailOtp.sendVerificationOtp({
			email: parsed.data,
			type: "sign-in",
		});
		setPending(false);
		if (result.error) {
			setError(
				result.error.message ?? "Could not send code. Please try again.",
			);
			return;
		}
		setStep("code");
	}

	async function verify(otp: string) {
		setError(null);
		setPending(true);
		const result = await signIn.emailOtp({ email, otp });
		setPending(false);
		if (result.error) {
			setError(
				result.error.message ?? "Invalid code. Check the email and try again.",
			);
			setCode("");
			return;
		}
		capture("signed_in", { method: "email" });
		router.push("/dashboard");
	}

	function handleVerify(e: React.FormEvent) {
		e.preventDefault();
		void verify(code);
	}

	if (step === "email") {
		return (
			<form className="flex w-full flex-col gap-3" onSubmit={handleSendCode}>
				<Input
					type="email"
					name="email"
					autoComplete="email"
					inputMode="email"
					placeholder="you@example.com"
					value={email}
					onChange={(e) => setEmail(e.target.value)}
					required
					className="h-10 rounded-xl"
					aria-label="Email address"
				/>
				<Button
					type="submit"
					disabled={pending || email.length === 0}
					className="h-10 w-full rounded-xl"
				>
					{pending ? <Spinner className="size-4" /> : "Continue with Email"}
				</Button>
				{error ? (
					<p className="text-center text-sm text-destructive">{error}</p>
				) : null}
			</form>
		);
	}

	return (
		<form className="flex w-full flex-col gap-3" onSubmit={handleVerify}>
			<p className="text-center text-sm text-muted-foreground">
				We sent a 6-digit code to{" "}
				<span className="text-foreground">{email}</span>
			</p>
			<div className="flex justify-center">
				<InputOTP
					maxLength={6}
					value={code}
					onChange={(value) => {
						setCode(value);
						if (value.length === 6) {
							void verify(value);
						}
					}}
					disabled={pending}
					autoFocus
					aria-label="Verification code"
				>
					<InputOTPGroup>
						<InputOTPSlot index={0} className="size-10" />
						<InputOTPSlot index={1} className="size-10" />
						<InputOTPSlot index={2} className="size-10" />
					</InputOTPGroup>
					<InputOTPSeparator />
					<InputOTPGroup>
						<InputOTPSlot index={3} className="size-10" />
						<InputOTPSlot index={4} className="size-10" />
						<InputOTPSlot index={5} className="size-10" />
					</InputOTPGroup>
				</InputOTP>
			</div>
			<Button
				type="submit"
				disabled={pending || code.length !== 6}
				className="h-10 w-full rounded-xl"
			>
				{pending ? <Spinner className="size-4" /> : "Continue"}
			</Button>
			<button
				type="button"
				onClick={() => {
					setStep("email");
					setCode("");
					setError(null);
				}}
				className="text-center text-xs text-muted-foreground hover:text-foreground"
			>
				Use a different email
			</button>
			{error ? (
				<p className="text-center text-sm text-destructive">{error}</p>
			) : null}
		</form>
	);
}
