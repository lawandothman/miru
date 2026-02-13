import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { AppSidebar } from "@/components/app-sidebar";
import {
	SidebarInset,
	SidebarProvider,
	SidebarTrigger,
} from "@/components/ui/sidebar";

export default async function AppLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	const session = await auth.api.getSession({
		headers: await headers(),
	});

	return (
		<SidebarProvider>
			<AppSidebar
				user={
					session?.user
						? {
								id: session.user.id,
								image: session.user.image ?? null,
								name: session.user.name,
							}
						: null
				}
			/>
			<SidebarInset>
				<header className="flex h-12 items-center gap-2 border-b border-border/50 px-4 md:hidden">
					<SidebarTrigger />
					<span className="font-display text-sm font-bold">Miru</span>
				</header>
				<div className="mx-auto w-full max-w-6xl px-4 py-6 lg:px-8 lg:py-8">
					{children}
				</div>
			</SidebarInset>
		</SidebarProvider>
	);
}
