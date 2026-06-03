export function movieSlug(title: string, tmdbId: number): string {
	const slug = title
		.toLowerCase()
		.normalize("NFD")
		.replace(/[\u0300-\u036f]/g, "")
		.replace(/[^a-z0-9]+/g, "-")
		.replace(/^-+|-+$/g, "");

	return `${slug}-${tmdbId}`;
}

export function movieIdFromSlug(slug: string): number {
	const match = slug.match(/-(\d+)$/);
	if (match?.[1]) {
		return parseInt(match[1], 10);
	}

	if (/^\d+$/.test(slug)) {
		return parseInt(slug, 10);
	}

	return NaN;
}
