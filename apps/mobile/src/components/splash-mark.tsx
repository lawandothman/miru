import { Image } from "expo-image";
import { StyleSheet } from "react-native";

export const SPLASH_BACKGROUND = "#000000";

export function SplashMark() {
	return (
		<Image
			source={require("../../assets/splash-icon.png")}
			style={StyleSheet.absoluteFill}
			contentFit="contain"
			contentPosition="center"
		/>
	);
}
