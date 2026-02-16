import "./src/env";
import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs";

const nextConfig: NextConfig = {
	reactCompiler: true,
	typedRoutes: true,
	images: {
		remotePatterns: [
			{
				protocol: "https",
				hostname: "image.tmdb.org",
			},
			{
				protocol: "https",
				hostname: "lh3.googleusercontent.com",
			},
			{
				protocol: "https",
				hostname: "**.public.blob.vercel-storage.com",
			},
		],
	},
	transpilePackages: ["@miru/db", "@miru/trpc"],
};

export default withSentryConfig(nextConfig, {
	org: "lwnd",
	project: "miru-web",
	silent: !process.env.CI,
	tunnelRoute: "/monitoring",
	authToken: process.env.SENTRY_AUTH_TOKEN,
	widenClientFileUpload: true,
});
