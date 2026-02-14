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
		<div className="flex min-h-svh items-center justify-center px-4 py-8">
			<div className="w-full max-w-2xl">{children}</div>
		</div>
	);
}
