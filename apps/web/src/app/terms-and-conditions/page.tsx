import type { Metadata } from "next";
import Link from "next/link";
import { MarketingShell } from "@/components/marketing-shell";

export const metadata: Metadata = {
	title: "Terms and Conditions",
};

export default function TermsAndConditionsPage() {
	return (
		<MarketingShell>
			<main className="mx-auto max-w-2xl px-6 pb-24 pt-12 lg:px-8">
				<h1 className="font-display text-3xl font-bold tracking-tight">
					Terms &amp; Conditions
				</h1>

				<div className="mt-8 space-y-6 leading-relaxed text-muted-foreground">
					<h2 className="font-display text-xl font-semibold text-foreground">
						Terms
					</h2>
					<p>
						By accessing this website, you are agreeing to be bound by these
						Terms and Conditions of Use and agree that you are responsible for
						compliance with any applicable local laws. If you disagree with any
						of these terms, you are prohibited from accessing this site.
					</p>

					<h2 className="font-display text-xl font-semibold text-foreground">
						Use Licence
					</h2>
					<p>
						Permission is granted to temporarily download one copy of the
						materials on Miru&apos;s website for personal, non-commercial
						transitory viewing only. Under this licence you may not:
					</p>
					<ul className="list-inside list-disc space-y-1 pl-2">
						<li>modify or copy the materials;</li>
						<li>
							use the materials for any commercial purpose or public display;
						</li>
						<li>
							attempt to reverse engineer any software contained on Miru&apos;s
							website;
						</li>
						<li>
							remove any copyright or other proprietary notations from the
							materials; or
						</li>
						<li>
							transfer the materials to another person or mirror them on any
							other server.
						</li>
					</ul>
					<p>
						Miru may terminate this licence upon violation of any of these
						restrictions. Upon termination, your viewing right will also be
						terminated and you should destroy any downloaded materials in your
						possession.
					</p>

					<h2 className="font-display text-xl font-semibold text-foreground">
						Disclaimer
					</h2>
					<p>
						All materials on Miru&apos;s website are provided &ldquo;as
						is&rdquo;. Miru makes no warranties, expressed or implied, and
						hereby disclaims all other warranties. Furthermore, Miru does not
						make any representations concerning the accuracy or reliability of
						the use of the materials on its website or otherwise relating to
						such materials or any sites linked to this website.
					</p>

					<h2 className="font-display text-xl font-semibold text-foreground">
						Limitations
					</h2>
					<p>
						Miru or its suppliers will not be held accountable for any damages
						that arise from the use or inability to use the materials on
						Miru&apos;s website, even if Miru or an authorised representative
						has been notified of the possibility of such damage.
					</p>

					<h2 className="font-display text-xl font-semibold text-foreground">
						Revisions
					</h2>
					<p>
						The materials on Miru&apos;s website may include technical,
						typographical, or photographic errors. Miru does not warrant that
						any of the materials are accurate, complete, or current. Miru may
						change the materials at any time without notice.
					</p>

					<h2 className="font-display text-xl font-semibold text-foreground">
						Links
					</h2>
					<p>
						Miru has not reviewed all sites linked to its website and is not
						responsible for the contents of any such linked site. The presence
						of any link does not imply endorsement by Miru. Use of any linked
						website is at the user&apos;s own risk.
					</p>

					<h2 className="font-display text-xl font-semibold text-foreground">
						Modifications
					</h2>
					<p>
						Miru may revise these Terms of Use at any time without prior notice.
						By using this website, you are agreeing to be bound by the current
						version of these Terms and Conditions.
					</p>

					<h2 className="font-display text-xl font-semibold text-foreground">
						Your Privacy
					</h2>
					<p>
						Please read our{" "}
						<Link
							href="/privacy"
							className="text-foreground underline underline-offset-2 hover:text-foreground/70"
						>
							Privacy Policy
						</Link>
						.
					</p>

					<h2 className="font-display text-xl font-semibold text-foreground">
						Governing Law
					</h2>
					<p>
						Any claim related to Miru&apos;s website shall be governed by the
						laws of England and Wales without regards to its conflict of law
						provisions.
					</p>
				</div>
			</main>
		</MarketingShell>
	);
}
