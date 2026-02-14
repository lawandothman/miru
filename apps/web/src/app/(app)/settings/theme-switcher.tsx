"use client";

import { useTheme } from "next-themes";
import { Monitor, Moon, Sun } from "lucide-react";
import { cn } from "@/lib/utils";

const themes = [
	{ icon: Sun, label: "Light", value: "light" },
	{ icon: Moon, label: "Dark", value: "dark" },
	{ icon: Monitor, label: "System", value: "system" },
] as const;

export function ThemeSwitcher() {
	const { theme, setTheme } = useTheme();

	return (
		<div className="space-y-3">
			<p className="text-sm text-muted-foreground">
				Choose how Miru looks to you.
			</p>
			<div className="inline-flex rounded-lg bg-muted/50 p-1">
				{themes.map((t) => {
					const isActive = theme === t.value;
					return (
						<button
							type="button"
							key={t.value}
							onClick={() => setTheme(t.value)}
							className={cn(
								"flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-all",
								isActive
									? "bg-background text-foreground shadow-sm"
									: "text-muted-foreground hover:text-foreground",
							)}
						>
							<t.icon className="size-4" />
							{t.label}
						</button>
					);
				})}
			</div>
		</div>
	);
}
