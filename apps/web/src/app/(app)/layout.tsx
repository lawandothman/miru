import * as Sentry from "@sentry/nextjs";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { AppSidebar } from "@/components/app-sidebar";
import { BottomNav } from "@/components/bottom-nav";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { auth } from "@/lib/auth";

export default async function AppLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	const session = await auth.api.getSession({
		headers: await headers(),
	});

	if (session?.user && !session.user.onboardingCompletedAt) {
		redirect("/onboarding");
	}

	if (session?.user) {
		Sentry.setUser({ id: session.user.id, email: session.user.email });
	}

	const user = session?.user
		? {
				id: session.user.id,
				image: session.user.image ?? null,
				name: session.user.name,
			}
		: null;

	return (
		<SidebarProvider>
			<div className="hidden md:contents">
				<AppSidebar user={user} />
			</div>
			<SidebarInset>
				<div className="mx-auto w-full max-w-6xl px-4 py-6 pb-28 md:pb-6 lg:px-8 lg:py-8">
					{children}
				</div>
			</SidebarInset>
			<BottomNav user={user} />
		</SidebarProvider>
	);
}
