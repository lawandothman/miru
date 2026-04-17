import {
	DynamicColorIOS,
	Platform,
	type ColorValue,
	useColorScheme,
} from "react-native";
import { darkColors, lightColors } from "@miru/design-tokens/colors";
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

type ColorKey = keyof typeof lightColors;
export type ResolvedColorScheme = "light" | "dark";
const colorKeys = Object.keys(lightColors) as ColorKey[];

export function resolveMobileColorScheme(
	scheme: ReturnType<typeof useColorScheme>,
): ResolvedColorScheme {
	if (Platform.OS !== "ios") {
		return "dark";
	}

	return scheme === "light" ? "light" : "dark";
}

export function useResolvedColorScheme(): ResolvedColorScheme {
	return resolveMobileColorScheme(useColorScheme());
}

export function getThemePalette(scheme: ResolvedColorScheme) {
	return scheme === "light" ? lightColors : darkColors;
}

function resolveColor(key: ColorKey): ColorValue {
	if (Platform.OS === "ios") {
		return DynamicColorIOS({ light: lightColors[key], dark: darkColors[key] });
	}
	return darkColors[key];
}

/**
 * Colors resolve to the system-appropriate token at render time on iOS via
 * DynamicColorIOS; Android falls back to darkColors for v1. Typed as
 * Record<ColorKey, string> to stay ergonomic at call sites — the runtime value
 * is actually an OpaqueColorValue that RN resolves natively.
 *
 * Do NOT interpolate these in template literals (`${Colors.x}${alpha}`).
 * Use dynamicColorAlpha instead.
 */
export const Colors = colorKeys.reduce(
	(acc, key) => {
		acc[key] = resolveColor(key);
		return acc;
	},
	{} as Record<ColorKey, ColorValue>,
) as unknown as Record<ColorKey, string>;

/**
 * Combines a design-token color with an alpha hex (e.g. "80" for 50%) while
 * keeping the result light/dark-reactive on iOS.
 */
export function dynamicColorAlpha(
	key: ColorKey,
	alphaHex: string,
): ColorValue {
	if (Platform.OS === "ios") {
		return DynamicColorIOS({
			light: `${lightColors[key]}${alphaHex}`,
			dark: `${darkColors[key]}${alphaHex}`,
		});
	}
	return `${darkColors[key]}${alphaHex}`;
}

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
