"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bookmark, Eye, Home, Search, User as UserIcon } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

const navItems = [
	{ href: "/dashboard", icon: Home, label: "Home" },
	{ href: "/explore", icon: Search, label: "Explore" },
	{ href: "/watchlist", icon: Bookmark, label: "Watchlist" },
	{ href: "/watched", icon: Eye, label: "Watched" },
];

interface BottomNavProps {
	user: { id: string; name: string; image: string | null } | null;
}

export function BottomNav({ user }: BottomNavProps) {
	const pathname = usePathname();

	return (
		<nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border/50 bg-background/80 pb-safe backdrop-blur-lg md:hidden">
			<div className="flex items-stretch justify-around pb-8">
				{navItems.map((item) => {
					const isActive =
						pathname === item.href || pathname.startsWith(`${item.href}/`);
					return (
						<Link
							key={item.href}
							href={item.href}
							className={cn(
								"flex min-h-16 flex-1 flex-col items-center justify-center gap-0.5 text-[10px] transition-colors active:bg-muted/50",
								isActive ? "text-foreground" : "text-muted-foreground",
							)}
						>
							<item.icon
								className="size-5"
								strokeWidth={isActive ? 2.5 : 1.5}
							/>
							<span>{item.label}</span>
						</Link>
					);
				})}

				{user ? (
					<Link
						href={`/user/${user.id}`}
						className={cn(
							"flex min-h-16 flex-1 flex-col items-center justify-center gap-0.5 text-[10px] transition-colors active:bg-muted/50",
							pathname === `/user/${user.id}`
								? "text-foreground"
								: "text-muted-foreground",
						)}
					>
						<Avatar className="size-5">
							{user.image && <AvatarImage src={user.image} alt={user.name} />}
							<AvatarFallback className="bg-primary/10 text-[8px] text-primary">
								{user.name.charAt(0).toUpperCase()}
							</AvatarFallback>
						</Avatar>
						<span>Profile</span>
					</Link>
				) : (
					<Link
						href="/signin"
						className={cn(
							"flex min-h-16 flex-1 flex-col items-center justify-center gap-0.5 text-[10px] transition-colors active:bg-muted/50",
							pathname === "/signin"
								? "text-foreground"
								: "text-muted-foreground",
						)}
					>
						<UserIcon className="size-5" strokeWidth={1.5} />
						<span>Sign In</span>
					</Link>
				)}
			</div>
		</nav>
	);
}
