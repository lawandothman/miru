import type { Metadata, Viewport } from "next";
import { DM_Sans, Syne } from "next/font/google";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Providers } from "@/components/providers";
import { Toaster } from "@/components/ui/sonner";
import { env } from "@/env";
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
	description:
		"Build your watchlist, follow friends, and instantly see which movies you both want to watch. The social way to pick your next movie.",
	icons: {
		apple: "/apple-touch-icon.png",
		icon: [
			{ sizes: "16x16", type: "image/png", url: "/favicon-16x16.png" },
			{ sizes: "32x32", type: "image/png", url: "/favicon-32x32.png" },
		],
	},
	keywords: [
		"movies",
		"watchlist",
		"social",
		"movie recommendations",
		"watch together",
		"film",
	],
	manifest: "/site.webmanifest",
	metadataBase: new URL(env.BETTER_AUTH_URL),
	openGraph: {
		description:
			"Build your watchlist, follow friends, and instantly see which movies you both want to watch.",
		locale: "en_GB",
		siteName: "Miru",
		title: "Miru",
		type: "website",
	},
	title: {
		default: "Miru — Find movies to watch with friends",
		template: "%s — Miru",
	},
	twitter: {
		card: "summary_large_image",
	},
};

export const viewport: Viewport = {
	themeColor: [
		{ color: "#fafafa", media: "(prefers-color-scheme: light)" },
		{ color: "#121212", media: "(prefers-color-scheme: dark)" },
	],
	viewportFit: "cover",
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
				<SpeedInsights />
			</body>
		</html>
	);
}
