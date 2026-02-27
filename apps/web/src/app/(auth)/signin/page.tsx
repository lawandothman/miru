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
						<svg
							className="size-5"
							viewBox="0 0 814.01 999.31"
							fill="currentColor"
						>
							<path d="M788.1,340.9c-5.8,4.5-108.2,62.2-108.2,190.5c0,148.4,130.3,200.9,134.2,202.2c-0.6,3.2-20.7,71.9-68.7,141.9c-42.8,61.6-87.5,123.1-155.5,123.1s-85.5-39.5-164-39.5c-76.5,0-103.7,40.8-165.9,40.8s-105.6-57.5-155.5-127.7c-57.8-81.8-104.4-209.4-104.4-330.4c0-194.3,126.4-297.5,250.8-297.5c66.1,0,121.2,43.4,162.7,43.4c39.5,0,101.1-46,176.3-46c28.5,0,130.9,2.6,198.3,99.2ZM554.1,159.4c31.1-36.9,53.1-88.1,53.1-139.3c0-7.1-0.6-14.3-1.9-20.1c-50.6,1.9-110.8,33.7-147.1,75.8c-28.5,32.4-55.1,83.6-55.1,135.5c0,7.8,1.3,15.6,1.9,18.1c3.2,0.6,8.4,1.3,13.6,1.3C462,230.7,521.7,200.3,554.1,159.4z" />
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
