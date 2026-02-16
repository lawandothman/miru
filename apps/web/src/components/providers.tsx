"use client";

import { ThemeProvider } from "next-themes";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import { TooltipProvider } from "@/components/ui/tooltip";
import { TRPCProvider } from "@/lib/trpc/provider";

export function Providers({ children }: { children: React.ReactNode }) {
	return (
		<ThemeProvider attribute="class" defaultTheme="system" enableSystem>
			<NuqsAdapter>
				<TRPCProvider>
					<TooltipProvider>{children}</TooltipProvider>
				</TRPCProvider>
			</NuqsAdapter>
		</ThemeProvider>
	);
}
