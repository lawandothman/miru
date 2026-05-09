import "server-only";
import { Resend } from "resend";
import { OtpEmail } from "@/emails/otp-email";
import { env } from "@/env";

const resend = new Resend(env.RESEND_API_KEY);

export async function sendOtpEmail(to: string, code: string) {
	await resend.emails.send({
		from: env.EMAIL_FROM,
		to,
		subject: `${code} is your Miru sign-in code`,
		react: OtpEmail({ code }),
	});
}
