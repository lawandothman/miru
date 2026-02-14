import type { Metadata } from "next";
import Link from "next/link";
import { MarketingShell } from "@/components/marketing-shell";

export const metadata: Metadata = {
	title: "Privacy Policy",
};

export default function PrivacyPage() {
	return (
		<MarketingShell>
			<main className="mx-auto max-w-2xl px-6 pb-24 pt-12 lg:px-8">
				<h1 className="font-display text-3xl font-bold tracking-tight">
					Privacy Policy
				</h1>

				<div className="mt-8 space-y-6 leading-relaxed text-muted-foreground">
					<p>
						At Miru, one of our main priorities is the privacy of our visitors.
						This Privacy Policy explains what information we collect and how we
						use it.
					</p>
					<p>
						If you have questions or require more information about our Privacy
						Policy, do not hesitate to contact us.
					</p>

					<h2 className="font-display text-xl font-semibold text-foreground">
						Log Files
					</h2>
					<p>
						Miru follows a standard procedure of using log files. These files
						log visitors when they visit the website. Information collected
						includes IP addresses, browser type, ISP, date and time stamps,
						referring/exit pages, and click counts. This data is not linked to
						any personally identifiable information and is used for analysing
						trends, administering the site, and gathering demographic
						information.
					</p>

					<h2 className="font-display text-xl font-semibold text-foreground">
						Cookies
					</h2>
					<p>
						Like most websites, Miru uses cookies to store information including
						visitor preferences and the pages accessed. This information is used
						to optimise your experience by customising content based on your
						browser type and other information.
					</p>

					<h2 className="font-display text-xl font-semibold text-foreground">
						Third-Party Privacy Policies
					</h2>
					<p>
						Miru&apos;s Privacy Policy does not apply to other websites or
						services. We advise you to consult the respective privacy policies
						of any third-party services for more detailed information.
					</p>
					<p>
						You can choose to disable cookies through your individual browser
						settings. More detailed information about cookie management can be
						found at your browser&apos;s respective website.
					</p>

					<h2 className="font-display text-xl font-semibold text-foreground">
						Children&apos;s Information
					</h2>
					<p>
						Miru does not knowingly collect any personally identifiable
						information from children under the age of 13. If you believe that
						your child has provided such information on our website, please
						contact us and we will promptly remove it from our records.
					</p>

					<h2 className="font-display text-xl font-semibold text-foreground">
						Online Privacy Policy Only
					</h2>
					<p>
						This Privacy Policy applies only to our online activities and is
						valid for visitors to our website with regards to the information
						that they share and/or we collect. This policy does not apply to any
						information collected offline or via channels other than this
						website.
					</p>

					<h2 className="font-display text-xl font-semibold text-foreground">
						Consent
					</h2>
					<p>
						By using our website, you consent to our Privacy Policy and agree to
						our{" "}
						<Link
							href="/terms-and-conditions"
							className="text-foreground underline underline-offset-2 hover:text-foreground/70"
						>
							Terms and Conditions
						</Link>
						.
					</p>
				</div>
			</main>
		</MarketingShell>
	);
}
