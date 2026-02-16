/**
 * Generates a URL slug for a movie: "fight-club-550"
 * The TMDB ID is always the trailing segment after the last hyphen.
 */
export function movieSlug(title: string, tmdbId: number): string {
	const slug = title
		.toLowerCase()
		.normalize("NFD")
		.replace(/[\u0300-\u036f]/g, "") // strip diacritics
		.replace(/[^a-z0-9]+/g, "-") // non-alphanumeric → hyphen
		.replace(/^-+|-+$/g, ""); // trim leading/trailing hyphens

	return `${slug}-${tmdbId}`;
}

/**
 * Extracts the TMDB ID from a slug like "fight-club-550" or bare "550".
 * Returns NaN if no valid ID can be extracted.
 */
export function movieIdFromSlug(slug: string): number {
	// Try trailing number after last hyphen: "fight-club-550" → 550
	const match = slug.match(/-(\d+)$/);
	if (match?.[1]) {
		return parseInt(match[1], 10);
	}

	// Bare numeric ID: "550" (backward compat)
	if (/^\d+$/.test(slug)) {
		return parseInt(slug, 10);
	}

	return NaN;
}
