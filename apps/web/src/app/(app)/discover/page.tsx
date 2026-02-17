import { unstable_cache } from "next/cache";
import type { Metadata } from "next";
import { schema } from "@miru/db";
import { db } from "@/lib/server";
import { DiscoverClient } from "./discover-client";

export const metadata: Metadata = {
	title: "Discover",
};

const getGenres = unstable_cache(
	async () => {
		const genres = await db.select().from(schema.genres);
		return genres.sort((a, b) => a.name.localeCompare(b.name));
	},
	["genres"],
	{ revalidate: false },
);

export default async function DiscoverPage() {
	const genres = await getGenres();

	return (
		<div className="space-y-6">
			<div>
				<h1 className="font-display text-2xl font-semibold tracking-tight">
					Discover
				</h1>
				<p className="mt-1 text-sm text-muted-foreground">
					Find your next movie to watch
				</p>
			</div>

			<DiscoverClient genres={genres} />
		</div>
	);
}
