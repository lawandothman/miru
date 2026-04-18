import { Image } from "expo-image";
import { StyleSheet, View } from "react-native";
import { type SplashScheme, useSplashScheme } from "@/hooks/use-splash-scheme";

export const SPLASH_BACKGROUND_DARK = "#000000";
export const SPLASH_BACKGROUND_LIGHT = "#fafafa";

// Matches `imageWidth` in the expo-splash-screen plugin config so this RN
// overlay renders the mark at the same size as the native cold-boot splash.
const MARK_SIZE = 100;

const DARK_SOURCE = require("../../assets/splash-icon-dark.png");
const LIGHT_SOURCE = require("../../assets/splash-icon-light.png");

export function splashBackgroundFor(scheme: SplashScheme) {
	return scheme === "light" ? SPLASH_BACKGROUND_LIGHT : SPLASH_BACKGROUND_DARK;
}

export function SplashMark() {
	const scheme = useSplashScheme();
	return (
		<View style={styles.container}>
			<Image
				source={scheme === "light" ? LIGHT_SOURCE : DARK_SOURCE}
				style={styles.image}
				contentFit="contain"
			/>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		...StyleSheet.absoluteFillObject,
		alignItems: "center",
		justifyContent: "center",
	},
	image: {
		width: MARK_SIZE,
		height: MARK_SIZE,
	},
});
