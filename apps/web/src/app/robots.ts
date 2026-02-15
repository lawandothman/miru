import type { MetadataRoute } from "next";
import { env } from "@/env";

export default function robots(): MetadataRoute.Robots {
	const baseUrl = env.BETTER_AUTH_URL;

	return {
		rules: {
			allow: "/",
			userAgent: "*",
		},
		sitemap: `${baseUrl}/sitemap.xml`,
	};
}
