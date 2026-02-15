import type { MetadataRoute } from "next";
import { env } from "@/env";
import { trpc } from "@/lib/trpc/server";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
	const baseUrl = env.BETTER_AUTH_URL;

	const api = await trpc();
	const genres = await api.movie.getGenres();

	return [
		{ changeFrequency: "weekly", priority: 1, url: baseUrl },
		{ changeFrequency: "daily", priority: 0.9, url: `${baseUrl}/explore` },
		{ changeFrequency: "daily", priority: 0.8, url: `${baseUrl}/popular` },
		...genres.map((g) => ({
			changeFrequency: "weekly" as const,
			priority: 0.7,
			url: `${baseUrl}/genre/${g.id}`,
		})),
	];
}
