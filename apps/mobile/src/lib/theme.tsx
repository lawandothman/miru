import { createContext, useContext, useMemo, type ReactNode } from "react";
import { useColorScheme } from "react-native";
import { darkColors, lightColors } from "@miru/design-tokens/colors";

export type ResolvedColorScheme = "light" | "dark";
export type ColorKey = keyof typeof lightColors;
export type ThemeColors = { readonly [K in ColorKey]: string };

type ThemeContextValue = {
	scheme: ResolvedColorScheme;
	colors: ThemeColors;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: ReactNode }) {
	const systemScheme = useColorScheme();
	const scheme: ResolvedColorScheme =
		systemScheme === "light" ? "light" : "dark";
	const value = useMemo<ThemeContextValue>(
		() => ({
			scheme,
			colors: scheme === "light" ? lightColors : darkColors,
		}),
		[scheme],
	);
	return (
		<ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
	);
}

export function useTheme(): ThemeContextValue {
	const ctx = useContext(ThemeContext);
	if (!ctx) {
		throw new Error("useTheme must be used within ThemeProvider");
	}
	return ctx;
}

export function useColors(): ThemeColors {
	return useTheme().colors;
}

export function useThemedStyles<T>(factory: (colors: ThemeColors) => T): T {
	const { colors } = useTheme();
	return useMemo(() => factory(colors), [colors, factory]);
}

export function colorWithAlpha(color: string, alphaHex: string): string {
	return `${color}${alphaHex}`;
}

export function getThemeColors(scheme: ResolvedColorScheme): ThemeColors {
	return scheme === "light" ? lightColors : darkColors;
}
