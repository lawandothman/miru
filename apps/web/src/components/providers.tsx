"use client";

import { ThemeProvider } from "next-themes";
import { TooltipProvider } from "@/components/ui/tooltip";
import { TRPCProvider } from "@/lib/trpc/provider";

export function Providers({ children }: { children: React.ReactNode }) {
	return (
		<ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
			<TRPCProvider>
				<TooltipProvider>{children}</TooltipProvider>
			</TRPCProvider>
		</ThemeProvider>
	);
}
