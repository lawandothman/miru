import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
	const baseUrl = process.env["BETTER_AUTH_URL"] ?? "https://miru-chi.vercel.app";

	return {
		rules: {
			allow: "/",
			userAgent: "*",
		},
		sitemap: `${baseUrl}/sitemap.xml`,
	};
}
