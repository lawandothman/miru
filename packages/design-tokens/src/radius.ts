/**
 * Border radius tokens in pixels.
 * Base value matches the web's --radius: 0.625rem (10px).
 */

const BASE = 10;

export const radius = {
	sm: BASE - 4,
	md: BASE - 2,
	lg: BASE,
	xl: BASE + 4,
	"2xl": BASE + 8,
	"3xl": BASE + 12,
	"4xl": BASE + 16,
	full: 9999,
} as const;

export type RadiusKey = keyof typeof radius;
