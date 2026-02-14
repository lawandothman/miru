"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
	Bookmark,
	Eye,
	Home,
	Search,
	Sparkles,
	TrendingUp,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
	Sidebar,
	SidebarContent,
	SidebarFooter,
	SidebarGroup,
	SidebarGroupContent,
	SidebarHeader,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
} from "@/components/ui/sidebar";

const navItems = [
	{ href: "/dashboard", icon: Home, label: "Home" },
	{ href: "/explore", icon: Search, label: "Explore" },
	{ href: "/watchlist", icon: Bookmark, label: "Watchlist" },
	{ href: "/watched", icon: Eye, label: "Watched" },
	{ href: "/for-you", icon: Sparkles, label: "For You" },
	{ href: "/popular", icon: TrendingUp, label: "Popular" },
];

interface AppSidebarProps {
	user: { id: string; name: string; image: string | null } | null;
}

export function AppSidebar({ user }: AppSidebarProps) {
	const pathname = usePathname();

	return (
		<Sidebar>
			<SidebarHeader className="px-4 py-3">
				<Link
					href={user ? "/dashboard" : "/"}
					className="font-display text-lg font-bold tracking-tight"
				>
					Miru
				</Link>
			</SidebarHeader>

			<SidebarContent>
				<SidebarGroup>
					<SidebarGroupContent>
						<SidebarMenu>
							{navItems.map((item) => {
								const isActive =
									pathname === item.href ||
									pathname.startsWith(`${item.href}/`);
								return (
									<SidebarMenuItem key={item.href}>
										<SidebarMenuButton
											asChild
											isActive={isActive}
											tooltip={item.label}
										>
											<Link href={item.href}>
												<item.icon />
												<span>{item.label}</span>
											</Link>
										</SidebarMenuButton>
									</SidebarMenuItem>
								);
							})}
						</SidebarMenu>
					</SidebarGroupContent>
				</SidebarGroup>
			</SidebarContent>

			{user && (
				<SidebarFooter>
					<SidebarMenu>
						<SidebarMenuItem>
							<SidebarMenuButton
								asChild
								isActive={pathname === `/user/${user.id}`}
								tooltip={user.name}
								size="lg"
							>
								<Link href={`/user/${user.id}`}>
									<Avatar className="size-6">
										{user.image && (
											<AvatarImage src={user.image} alt={user.name} />
										)}
										<AvatarFallback className="bg-primary/10 text-[10px] text-primary">
											{user.name.charAt(0).toUpperCase()}
										</AvatarFallback>
									</Avatar>
									<span className="truncate">{user.name}</span>
								</Link>
							</SidebarMenuButton>
						</SidebarMenuItem>
					</SidebarMenu>
				</SidebarFooter>
			)}
		</Sidebar>
	);
}
