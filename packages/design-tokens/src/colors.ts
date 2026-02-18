/**
 * Color tokens derived from the web app's OKLCH values in globals.css.
 * Single source of truth for both web and mobile.
 *
 * Web: globals.css references these via OKLCH (visually identical).
 * Mobile: imports hex values directly for React Native StyleSheet.
 */

export const lightColors = {
	background: "#fafafa",
	foreground: "#060606",
	card: "#f5f5f5",
	cardForeground: "#060606",
	popover: "#fafafa",
	popoverForeground: "#060606",
	primary: "#905b20",
	primaryForeground: "#fafafa",
	secondary: "#f2f2f2",
	secondaryForeground: "#161616",
	muted: "#f4f1ee",
	mutedForeground: "#555555",
	accent: "#f6f1eb",
	accentForeground: "#161616",
	destructive: "#cc272e",
	border: "#e1e1e1",
	input: "#e1e1e1",
	ring: "#905b20",
	gold: "#daa24f",
	goldForeground: "#100a03",
	goldMuted: "#c5a984",
} as const;

export const darkColors = {
	background: "#010101",
	foreground: "#e8e8e8",
	card: "#0a0a0a",
	cardForeground: "#e8e8e8",
	popover: "#0a0a0a",
	popoverForeground: "#e8e8e8",
	primary: "#deaf5c",
	primaryForeground: "#0a0501",
	secondary: "#090909",
	secondaryForeground: "#e8e8e8",
	muted: "#0a0907",
	mutedForeground: "#717171",
	accent: "#100d09",
	accentForeground: "#e8e8e8",
	destructive: "#f04c55",
	border: "rgba(255, 255, 255, 0.08)",
	input: "rgba(255, 255, 255, 0.10)",
	ring: "#deaf5c",
	gold: "#deaf5c",
	goldForeground: "#0a0501",
	goldMuted: "#ccb48c",
} as const;

export type ColorToken = keyof typeof lightColors;
export type ColorScheme = typeof lightColors;
