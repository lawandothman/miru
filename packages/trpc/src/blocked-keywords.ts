/**
 * TMDB keyword IDs for adult/NSFW content that TMDB misclassifies as non-adult.
 * Used to filter these movies at every entry point.
 */
export const BLOCKED_KEYWORD_IDS = new Set<number>([
	155477, // softcore
	445, // pornography
	190370, // erotic movie
	343572, // erotic film
	155691, // erotic vignettes
	5593, // pornographic video
	272027, // pornographic animation
	154986, // gonzo pornography
	230416, // big tits
	238355, // gay pornography
	277271, // romantic pornographic
	335703, // trans pornography
	335853, // early pornographic film
	347722, // lesbian pornography
	331947, // bisexual pornography
	364146, // post-pornography
	256603, // erotic masseuse
	364927, // alt pornography
]);

/** Pipe-separated string for TMDB's `without_keywords` API param */
export const BLOCKED_KEYWORDS_PARAM = [...BLOCKED_KEYWORD_IDS].join("|");

export function hasBlockedKeyword(keywords: { id: number }[]): boolean {
	return keywords.some((k) => BLOCKED_KEYWORD_IDS.has(k.id));
}
