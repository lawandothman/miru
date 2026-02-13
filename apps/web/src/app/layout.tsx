import type { Metadata, Viewport } from "next";
import { DM_Sans, Syne } from "next/font/google";
import { Providers } from "@/components/providers";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

const syne = Syne({
	display: "swap",
	subsets: ["latin"],
	variable: "--font-syne",
});

const dmSans = DM_Sans({
	display: "swap",
	subsets: ["latin"],
	variable: "--font-dm-sans",
});

export const metadata: Metadata = {
	description: "Find movies to watch with your friends",
	title: {
		default: "Miru",
		template: "%s — Miru",
	},
};

export const viewport: Viewport = {
	themeColor: [
		{ color: "#fafafa", media: "(prefers-color-scheme: light)" },
		{ color: "#121212", media: "(prefers-color-scheme: dark)" },
	],
};

export default function RootLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<html lang="en" suppressHydrationWarning>
			<body
				className={`${syne.variable} ${dmSans.variable} font-sans antialiased`}
			>
				<Providers>
					{children}
					<Toaster />
				</Providers>
			</body>
		</html>
	);
}
