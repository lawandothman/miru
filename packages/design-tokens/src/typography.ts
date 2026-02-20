/**
 * Typography tokens.
 *
 * Font families:
 * - Web uses DM Sans (body) and Syne (display) via Google Fonts / CSS variables.
 * - Mobile loads custom fonts via expo-font with weight-specific names.
 *
 * Size and weight values are shared across both platforms.
 */

export const fontFamily = {
	sans: "DM Sans",
	display: "Syne",
	mono: "monospace",
} as const;

/**
 * React Native requires weight-specific font family names.
 * These map to @expo-google-fonts loaded fonts.
 */
export const mobileFontFamily = {
	sans: "DMSans_400Regular",
	sansMedium: "DMSans_500Medium",
	sansSemibold: "DMSans_600SemiBold",
	sansBold: "DMSans_700Bold",
	display: "Syne_400Regular",
	displaySemibold: "Syne_600SemiBold",
	displayBold: "Syne_700Bold",
} as const;

export const fontSize = {
	xs: 12,
	sm: 14,
	base: 16,
	lg: 18,
	xl: 20,
	"2xl": 24,
	"3xl": 30,
	"4xl": 36,
	"5xl": 48,
} as const;

export const lineHeight = {
	xs: 16,
	sm: 20,
	base: 24,
	lg: 28,
	xl: 28,
	"2xl": 32,
	"3xl": 36,
	"4xl": 40,
	"5xl": 48,
} as const;

export const fontWeight = {
	normal: "400" as const,
	medium: "500" as const,
	semibold: "600" as const,
	bold: "700" as const,
};

export type FontSizeKey = keyof typeof fontSize;
