import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";

export default async function OnboardingLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	const session = await auth.api.getSession({
		headers: await headers(),
	});

	if (!session?.user) {
		redirect("/signin");
	}

	if (session.user.onboardingCompletedAt) {
		redirect("/dashboard");
	}

	return (
		<div className="min-h-svh px-4 pt-12 sm:pt-20">
			<div className="mx-auto w-full max-w-2xl">{children}</div>
		</div>
	);
}
