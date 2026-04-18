import {
	DarkTheme as ReactNavigationDarkTheme,
	DefaultTheme as ReactNavigationDefaultTheme,
	type Theme,
} from "@react-navigation/native";
import { useMemo } from "react";
import {
	fontFamily,
	getThemePalette,
	type ResolvedColorScheme,
	useResolvedColorScheme,
} from "@/lib/constants";

function createDefaultHeaderOptions(scheme: "light" | "dark") {
	const palette = getThemePalette(scheme);

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
	const resolvedScheme = useResolvedColorScheme();

	return useMemo(
		() => createDefaultHeaderOptions(resolvedScheme),
		[resolvedScheme],
	);
}

export function getNavigationTheme(scheme: ResolvedColorScheme): Theme {
	const palette = getThemePalette(scheme);
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
