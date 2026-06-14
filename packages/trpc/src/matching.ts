export interface DashboardMatch {
	id: number;
	posterPath: string | null;
	title: string;
}

export function parseDashboardMatches(
	matches: DashboardMatch[] | string,
): DashboardMatch[] {
	return typeof matches === "string"
		? (JSON.parse(matches) as DashboardMatch[])
		: matches;
}

export function filterUnwatchedMatches<T extends { id: number }>(
	matches: T[],
	myWatchedIds: Iterable<number>,
	friendWatchedIds: Iterable<number>,
): Array<T & { inWatchlist: true }> {
	const myWatched = new Set(myWatchedIds);
	const friendWatched = new Set(friendWatchedIds);
	return matches
		.filter((m) => !myWatched.has(m.id) && !friendWatched.has(m.id))
		.map((m) => ({ ...m, inWatchlist: true as const }));
}
