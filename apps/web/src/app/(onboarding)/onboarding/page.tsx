import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { OnboardingClient } from "./onboarding-client";

export default async function OnboardingPage() {
	const session = await auth.api.getSession({
		headers: await headers(),
	});

	if (!session?.user) {
		redirect("/signin");
	}

	return <OnboardingClient initialName={session.user.name ?? ""} />;
}
