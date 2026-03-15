import type { MetadataRoute } from "next";
import { env } from "@/env";
import { trpc } from "@/lib/trpc/server";
import { movieSlug } from "@/lib/movie-slug";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
	const baseUrl = env.BETTER_AUTH_URL;

	const api = await trpc();
	const [genres, popular] = await Promise.all([
		api.movie.getGenres(),
		api.movie.getPopular({ limit: 100 }),
	]);

	return [
		{ changeFrequency: "weekly", priority: 1, url: baseUrl },
		{ changeFrequency: "daily", priority: 0.9, url: `${baseUrl}/discover` },
		...genres.map((g) => ({
			changeFrequency: "weekly" as const,
			priority: 0.7,
			url: `${baseUrl}/genre/${g.id}`,
		})),
		...popular.map((m) => ({
			changeFrequency: "monthly" as const,
			priority: 0.6,
			url: `${baseUrl}/movie/${movieSlug(m.title, m.id)}`,
		})),
	];
}
