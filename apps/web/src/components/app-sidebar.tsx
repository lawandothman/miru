"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bookmark, Compass, Eye, Home, Sparkles } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
	Sidebar,
	SidebarContent,
	SidebarFooter,
	SidebarHeader,
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";

const navItems = [
	{ href: "/dashboard", icon: Home, label: "Home" },
	{ href: "/discover", icon: Compass, label: "Discover" },
	{ href: "/watchlist", icon: Bookmark, label: "Watchlist" },
	{ href: "/watched", icon: Eye, label: "Watched" },
	{ href: "/for-you", icon: Sparkles, label: "For You" },
] as const;

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

			{/* Navigation */}
			<SidebarContent className="px-3 pt-1">
				<nav className="flex flex-col gap-1">
					{navItems.map((item) => {
						const isActive =
							pathname === item.href || pathname.startsWith(`${item.href}/`);
						return (
							<Link
								key={item.href}
								href={item.href}
								className={cn(
									"group/item relative flex items-center gap-4 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200 ease-out",
									isActive
										? "bg-sidebar-accent text-foreground"
										: "text-muted-foreground hover:bg-sidebar-accent/60 hover:text-foreground",
								)}
							>
								{/* Active indicator bar */}
								<span
									className={cn(
										"absolute left-0 top-1/2 w-[3px] -translate-y-1/2 rounded-full bg-primary transition-all duration-300 ease-out",
										isActive ? "h-5 opacity-100 sidebar-glow" : "h-0 opacity-0",
									)}
								/>

								<item.icon
									className={cn(
										"size-6 shrink-0 transition-all duration-200",
										isActive ? "text-primary" : "group-hover/item:scale-110",
									)}
									strokeWidth={isActive ? 2.4 : 1.6}
								/>

								<span className="truncate">{item.label}</span>
							</Link>
						);
					})}
				</nav>
			</SidebarContent>

			{/* Profile */}
			{user && (
				<SidebarFooter className="p-3 pb-6">
					<Link
						href={`/user/${user.id}`}
						className={cn(
							"group/profile flex items-center gap-3.5 rounded-xl px-4 py-3 transition-all duration-200",
							pathname === `/user/${user.id}`
								? "bg-sidebar-accent"
								: "hover:bg-sidebar-accent/60",
						)}
					>
						<div className="relative shrink-0">
							{/* Gradient ring — visible on hover and active */}
							<div
								className={cn(
									"absolute -inset-[3px] rounded-full bg-gradient-to-br from-primary to-gold opacity-0 transition-opacity duration-300",
									"group-hover/profile:opacity-100",
									pathname === `/user/${user.id}` && "opacity-100",
								)}
							/>
							<Avatar className="relative size-9 ring-[2.5px] ring-sidebar">
								{user.image && <AvatarImage src={user.image} alt={user.name} />}
								<AvatarFallback
									className={cn(
										"text-xs font-bold transition-colors duration-300",
										pathname === `/user/${user.id}`
											? "bg-primary text-primary-foreground"
											: "bg-primary/15 text-primary group-hover/profile:bg-primary group-hover/profile:text-primary-foreground",
									)}
								>
									{user.name.charAt(0).toUpperCase()}
								</AvatarFallback>
							</Avatar>
						</div>
						<div className="flex min-w-0 flex-col">
							<span className="truncate text-sm font-semibold text-foreground">
								{user.name}
							</span>
							<span className="text-[11px] leading-tight text-muted-foreground">
								Profile
							</span>
						</div>
					</Link>
				</SidebarFooter>
			)}
		</Sidebar>
	);
}
