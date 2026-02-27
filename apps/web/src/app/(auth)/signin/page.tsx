"use client";

import Link from "next/link";
import { signIn } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";

export default function SignInPage() {
	return (
		<main className="flex min-h-svh flex-col items-center justify-center px-6">
			<div className="flex w-full max-w-sm flex-col items-center gap-8">
				<div className="flex flex-col items-center gap-2 text-center">
					<Link
						href="/"
						className="font-display text-2xl font-bold tracking-tight"
					>
						Miru
					</Link>
					<p className="text-sm text-muted-foreground">Sign in to continue</p>
				</div>

				<div className="flex w-full flex-col gap-3">
					<Button
						variant="outline"
						onClick={() =>
							signIn.social({
								callbackURL: "/dashboard",
								provider: "apple",
							})
						}
						className="h-12 w-full gap-3 rounded-full"
					>
						<svg className="size-5" viewBox="0 0 24 24" fill="currentColor">
							<path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
						</svg>
						Continue with Apple
					</Button>

					<Button
						variant="outline"
						onClick={() =>
							signIn.social({
								callbackURL: "/dashboard",
								provider: "google",
							})
						}
						className="h-12 w-full gap-3 rounded-full"
					>
						<svg className="size-5" viewBox="0 0 24 24">
							<path
								d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
								fill="#4285F4"
							/>
							<path
								d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
								fill="#34A853"
							/>
							<path
								d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
								fill="#FBBC05"
							/>
							<path
								d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
								fill="#EA4335"
							/>
						</svg>
						Continue with Google
					</Button>
				</div>

				<p className="text-center text-xs text-muted-foreground">
					By signing in, you agree to our{" "}
					<Link
						href="/terms-and-conditions"
						className="underline underline-offset-2 hover:text-foreground"
					>
						Terms
					</Link>{" "}
					and{" "}
					<Link
						href="/privacy"
						className="underline underline-offset-2 hover:text-foreground"
					>
						Privacy Policy
					</Link>
					.
				</p>
			</div>
		</main>
	);
}
