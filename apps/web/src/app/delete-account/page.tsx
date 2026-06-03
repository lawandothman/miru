import type { Metadata } from "next";
import { MarketingShell } from "@/components/marketing-shell";

export const metadata: Metadata = {
	title: "Delete your account",
};

export default function DeleteAccountPage() {
	return (
		<MarketingShell>
			<main className="mx-auto max-w-2xl px-6 pb-24 pt-12 lg:px-8">
				<h1 className="font-display text-3xl font-semibold tracking-tight">
					Delete your Miru account
				</h1>

				<div className="mt-8 max-w-prose space-y-6 leading-relaxed text-muted-foreground">
					<p>
						You can permanently delete your Miru account and all associated
						data at any time. This page explains how.
					</p>

					<h2 className="font-display text-xl font-semibold text-foreground">
						Delete from the app
					</h2>
					<ol className="list-decimal space-y-2 pl-6">
						<li>Open the Miru app and sign in.</li>
						<li>Go to the Profile tab.</li>
						<li>Tap the settings icon, then tap Delete account.</li>
						<li>Confirm the deletion when prompted.</li>
					</ol>
					<p>
						Your account is removed immediately and cannot be recovered.
					</p>

					<h2 className="font-display text-xl font-semibold text-foreground">
						What gets deleted
					</h2>
					<p>
						When you delete your account, we permanently remove:
					</p>
					<ul className="list-disc space-y-2 pl-6">
						<li>Your name, email address, and profile photo</li>
						<li>Your watchlist and saved movies</li>
						<li>Your genre, region, and streaming-service preferences</li>
						<li>Recommendations you have sent or received</li>
						<li>Your follow / follower relationships with other users</li>
						<li>Your authentication credentials (Google or Apple sign-in linkage, email OTP records)</li>
						<li>Push notification tokens linked to your account</li>
					</ul>

					<h2 className="font-display text-xl font-semibold text-foreground">
						What we may retain
					</h2>
					<p>
						We retain anonymised, aggregated analytics events and crash logs
						that cannot be linked back to you personally. These are kept for
						product-improvement and security purposes in line with our{" "}
						<a href="/privacy" className="underline">Privacy Policy</a>.
					</p>

					<h2 className="font-display text-xl font-semibold text-foreground">
						If you cannot access the app
					</h2>
					<p>
						If you are unable to sign in or no longer have the app installed,
						email{" "}
						<a
							href="mailto:support@watchmiru.app"
							className="underline"
						>
							support@watchmiru.app
						</a>{" "}
						from the address linked to your Miru account and request
						deletion. We will verify ownership and remove your account within
						30 days.
					</p>
				</div>
			</main>
		</MarketingShell>
	);
}
