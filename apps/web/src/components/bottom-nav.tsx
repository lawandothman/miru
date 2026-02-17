"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
	Bookmark,
	Compass,
	Home,
	Sparkles,
	User as UserIcon,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

const navItems = [
	{ href: "/dashboard", icon: Home, label: "Home" },
	{ href: "/discover", icon: Compass, label: "Discover" },
	{ href: "/watchlist", icon: Bookmark, label: "Watchlist" },
	{ href: "/for-you", icon: Sparkles, label: "For You" },
] as const;

interface BottomNavProps {
	user: { id: string; name: string; image: string | null } | null;
}

export function BottomNav({ user }: BottomNavProps) {
	const pathname = usePathname();

	return (
		<nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border/20 bg-background/60 pb-[calc(env(safe-area-inset-bottom,0px))] backdrop-blur-2xl backdrop-saturate-150 md:hidden">
			<div className="flex items-stretch justify-around">
				{navItems.map((item) => {
					const isActive =
						pathname === item.href || pathname.startsWith(`${item.href}/`);
					return (
						<Link
							key={item.href}
							href={item.href}
							className={cn(
								"relative flex min-h-[52px] flex-1 flex-col items-center justify-center gap-0.5 text-[10px] font-medium transition-colors duration-200",
								isActive
									? "text-foreground"
									: "text-muted-foreground active:text-foreground",
							)}
						>
							<item.icon
								className="size-[22px]"
								strokeWidth={isActive ? 2.4 : 1.5}
							/>
							<span>{item.label}</span>
							{/* Active dot indicator */}
							<span
								className={cn(
									"absolute bottom-1.5 size-1 rounded-full bg-primary transition-all duration-300",
									isActive ? "scale-100 opacity-100" : "scale-0 opacity-0",
								)}
							/>
						</Link>
					);
				})}

				{user ? (
					<Link
						href={`/user/${user.id}`}
						className={cn(
							"relative flex min-h-[52px] flex-1 flex-col items-center justify-center gap-0.5 text-[10px] font-medium transition-colors duration-200",
							pathname === `/user/${user.id}`
								? "text-foreground"
								: "text-muted-foreground active:text-foreground",
						)}
					>
						<Avatar
							className={cn(
								"size-[22px] transition-all duration-200",
								pathname === `/user/${user.id}` &&
									"ring-[1.5px] ring-primary ring-offset-1 ring-offset-background",
							)}
						>
							{user.image && <AvatarImage src={user.image} alt={user.name} />}
							<AvatarFallback className="bg-primary/15 text-[7px] font-bold text-primary">
								{user.name.charAt(0).toUpperCase()}
							</AvatarFallback>
						</Avatar>
						<span>Profile</span>
						<span
							className={cn(
								"absolute bottom-1.5 size-1 rounded-full bg-primary transition-all duration-300",
								pathname === `/user/${user.id}`
									? "scale-100 opacity-100"
									: "scale-0 opacity-0",
							)}
						/>
					</Link>
				) : (
					<Link
						href="/signin"
						className={cn(
							"relative flex min-h-[52px] flex-1 flex-col items-center justify-center gap-0.5 text-[10px] font-medium transition-colors duration-200",
							pathname === "/signin"
								? "text-foreground"
								: "text-muted-foreground active:text-foreground",
						)}
					>
						<UserIcon className="size-[22px]" strokeWidth={1.5} />
						<span>Sign In</span>
					</Link>
				)}
			</div>
		</nav>
	);
}
