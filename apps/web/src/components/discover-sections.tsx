"use client";

import { trpc } from "@/lib/trpc/client";
import { MovieCarousel, MovieCarouselSkeleton } from "./movie-carousel";

const SECTIONS = [
	{ key: "trending", title: "Trending Now" },
	{ key: "newReleases", title: "New Releases" },
	{ key: "popularOnMiru", title: "Popular on Miru" },
	{ key: "friendsWatching", title: "Friends Are Watching" },
] as const;

type SectionKey = (typeof SECTIONS)[number]["key"];

export function DiscoverSections() {
	const { data, isLoading } = trpc.movie.getDiscoverSections.useQuery();

	if (isLoading) {
		return <DiscoverSectionsSkeleton />;
	}

	if (!data) {
		return null;
	}

	return (
		<div className="space-y-8">
			{SECTIONS.map(({ key, title }) => (
				<MovieCarousel
					key={key}
					title={title}
					movies={data[key as SectionKey]}
				/>
			))}
		</div>
	);
}

export function DiscoverSectionsSkeleton() {
	return (
		<div className="space-y-8">
			{Array.from({ length: 3 }, (_, i) => (
				<MovieCarouselSkeleton key={i} />
			))}
		</div>
	);
}
