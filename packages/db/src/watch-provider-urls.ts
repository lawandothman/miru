/**
 * Maps canonical watch provider IDs to their search URL patterns.
 * Uses the movie title as a search query to land the user on the right page.
 *
 * Provider IDs are expected to already be canonicalized (the server normalizes
 * aliases before storing), so this module has no dependency on the
 * canonicalization logic and can be used from any package.
 */

const providerSearchUrls: Record<number, (query: string) => string> = {
	// Netflix
	8: (q) => `https://www.netflix.com/search?q=${q}`,
	// Amazon Prime Video
	9: (q) => `https://www.amazon.com/s?k=${q}&i=instant-video`,
	// Apple TV+
	2: (q) => `https://tv.apple.com/search?term=${q}`,
	// Disney+
	337: (q) => `https://www.disneyplus.com/search/${q}`,
	// Hulu
	15: (q) => `https://www.hulu.com/search?q=${q}`,
	// Max (HBO)
	1899: (q) => `https://play.max.com/search?q=${q}`,
	// Peacock
	386: (q) => `https://www.peacocktv.com/search?q=${q}`,
	// Paramount+
	531: (q) => `https://www.paramountplus.com/search/?q=${q}`,
	// ITVX
	41: (q) => `https://www.itv.com/search?q=${q}`,
	// Channel 4
	103: (q) => `https://www.channel4.com/search?q=${q}`,
	// Mubi
	11: (q) => `https://mubi.com/search?query=${q}`,
	// Crunchyroll
	283: (q) => `https://www.crunchyroll.com/search?q=${q}`,
	// Starz
	43: (q) => `https://www.starz.com/search?q=${q}`,
	// Showtime / Paramount+ with Showtime
	37: (q) => `https://www.paramountplus.com/search/?q=${q}`,
	// Tubi
	73: (q) => `https://tubitv.com/search/${q}`,
	// Pluto TV
	300: (q) => `https://pluto.tv/search/details/${q}`,
	// BritBox
	380: (q) => `https://www.britbox.com/search?q=${q}`,
};

export function getWatchProviderUrl(
	providerId: number,
	movieTitle: string,
): string | null {
	const buildUrl = providerSearchUrls[providerId];
	if (!buildUrl) {
		return null;
	}
	return buildUrl(encodeURIComponent(movieTitle));
}
