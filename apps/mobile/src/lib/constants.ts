import { darkColors } from "@miru/design-tokens/colors";
import { spacing } from "@miru/design-tokens/spacing";
import { radius } from "@miru/design-tokens/radius";
import {
	mobileFontFamily,
	fontSize,
	lineHeight,
	fontWeight,
} from "@miru/design-tokens/typography";

export { spacing, radius, fontSize, lineHeight, fontWeight };

export const fontFamily = mobileFontFamily;

// Mobile is dark-mode only for v1
export const Colors = darkColors;

// TMDB image helpers
export const TMDB_IMAGE_BASE = "https://image.tmdb.org/t/p";

export function posterUrl(path: string | null | undefined): string | undefined {
	if (!path) {
		return undefined;
	}
	return `${TMDB_IMAGE_BASE}/w342${path}`;
}

export function backdropUrl(
	path: string | null | undefined,
): string | undefined {
	if (!path) {
		return undefined;
	}
	return `${TMDB_IMAGE_BASE}/w780${path}`;
}

export function providerLogoUrl(
	path: string | null | undefined,
): string | undefined {
	if (!path) {
		return undefined;
	}
	return `${TMDB_IMAGE_BASE}/w92${path}`;
}
