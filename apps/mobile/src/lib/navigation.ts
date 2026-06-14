import {
	DarkTheme as ReactNavigationDarkTheme,
	DefaultTheme as ReactNavigationDefaultTheme,
	type Theme,
} from "expo-router/react-navigation";
import { useMemo } from "react";
import { fontFamily } from "@/lib/constants";
import {
	getThemeColors,
	useTheme,
	type ResolvedColorScheme,
} from "@/lib/theme";

function createDefaultHeaderOptions(scheme: ResolvedColorScheme) {
	const palette = getThemeColors(scheme);

	return {
		headerShown: true,
		headerBackTitle: "",
		headerShadowVisible: false,
		headerStyle: { backgroundColor: palette.background },
		headerTintColor: palette.foreground,
		headerTitleStyle: {
			fontFamily: fontFamily.displayBold,
			color: palette.foreground,
		},
	};
}

export function useDefaultHeaderOptions() {
	const { scheme } = useTheme();
	return useMemo(() => createDefaultHeaderOptions(scheme), [scheme]);
}

export function getNavigationTheme(scheme: ResolvedColorScheme): Theme {
	const palette = getThemeColors(scheme);
	const baseTheme =
		scheme === "light" ? ReactNavigationDefaultTheme : ReactNavigationDarkTheme;

	return {
		...baseTheme,
		colors: {
			...baseTheme.colors,
			primary: palette.primary,
			background: palette.background,
			card: palette.background,
			text: palette.foreground,
			border: palette.border,
			notification: palette.destructive,
		},
	};
}
