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
	description:
		"Build your watchlist, follow friends, and instantly see which movies you both want to watch. The social way to pick your next movie.",
	keywords: [
		"movies",
		"watchlist",
		"social",
		"movie recommendations",
		"watch together",
		"film",
	],
	metadataBase: new URL(
		process.env["BETTER_AUTH_URL"] ?? "https://miru-chi.vercel.app",
	),
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
