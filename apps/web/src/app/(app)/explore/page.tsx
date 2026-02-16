import { unstable_cache } from "next/cache";
import { schema } from "@miru/db";
import { db } from "@/lib/server";
import { ExploreClient } from "./explore-client";

const getGenres = unstable_cache(
	async () => {
		const genres = await db.select().from(schema.genres);
		return genres.sort((a, b) => a.name.localeCompare(b.name));
	},
	["genres"],
	{ revalidate: false },
);

export default async function ExplorePage() {
	const genres = await getGenres();

	return (
		<div className="space-y-6">
			<div>
				<h1 className="font-display text-2xl font-semibold tracking-tight">
					Explore
				</h1>
				<p className="mt-1 text-sm text-muted-foreground">
					Search for movies and people
				</p>
			</div>

			<ExploreClient genres={genres} />
		</div>
	);
}
