import { useColorScheme } from "react-native";

export type SplashScheme = "light" | "dark";

/**
 * Follows system appearance (matches the native splash).
 *
 * Differs from `useResolvedColorScheme`: does not force "dark" on Android
 * (the native splash respects drawable/drawable-night), and defaults to
 * "light" when `useColorScheme()` hasn't resolved yet — matching iOS's
 * default appearance so the handoff from native splash to the RN overlay
 * is seamless.
 */
export function useSplashScheme(): SplashScheme {
	const scheme = useColorScheme();
	return scheme === "dark" ? "dark" : "light";
}
