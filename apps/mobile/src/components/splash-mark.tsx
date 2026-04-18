import { Image } from "expo-image";
import { StyleSheet } from "react-native";
import {
	type ResolvedColorScheme,
	useResolvedColorScheme,
} from "@/lib/constants";

export const SPLASH_BACKGROUND_DARK = "#000000";
export const SPLASH_BACKGROUND_LIGHT = "#fafafa";

const DARK_SOURCE = require("../../assets/splash-icon-dark.png");
const LIGHT_SOURCE = require("../../assets/splash-icon-light.png");

export function splashBackgroundFor(scheme: ResolvedColorScheme) {
	return scheme === "light" ? SPLASH_BACKGROUND_LIGHT : SPLASH_BACKGROUND_DARK;
}

export function SplashMark() {
	const scheme = useResolvedColorScheme();
	return (
		<Image
			source={scheme === "light" ? LIGHT_SOURCE : DARK_SOURCE}
			style={StyleSheet.absoluteFill}
			contentFit="contain"
			contentPosition="center"
		/>
	);
}
