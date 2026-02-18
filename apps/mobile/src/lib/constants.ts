import { darkColors } from "@miru/design-tokens/colors";
import { spacing } from "@miru/design-tokens/spacing";
import { radius } from "@miru/design-tokens/radius";
import { fontSize, lineHeight, fontWeight } from "@miru/design-tokens/typography";

export { spacing, radius, fontSize, lineHeight, fontWeight };

// Font family names matching the loaded @expo-google-fonts
export const fontFamily = {
  sans: "DMSans_400Regular",
  sansMedium: "DMSans_500Medium",
  sansSemibold: "DMSans_600SemiBold",
  sansBold: "DMSans_700Bold",
  display: "Syne_400Regular",
  displaySemibold: "Syne_600SemiBold",
  displayBold: "Syne_700Bold",
} as const;

// Mobile is dark-mode only for v1
export const Colors = darkColors;

// TMDB image helpers
export const TMDB_IMAGE_BASE = "https://image.tmdb.org/t/p";

export function posterUrl(path: string | null | undefined): string | undefined {
  if (!path) return undefined;
  return `${TMDB_IMAGE_BASE}/w342${path}`;
}

export function backdropUrl(
  path: string | null | undefined,
): string | undefined {
  if (!path) return undefined;
  return `${TMDB_IMAGE_BASE}/w780${path}`;
}

export function providerLogoUrl(
  path: string | null | undefined,
): string | undefined {
  if (!path) return undefined;
  return `${TMDB_IMAGE_BASE}/w92${path}`;
}
