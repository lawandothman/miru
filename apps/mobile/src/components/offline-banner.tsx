import { StyleSheet, Text, View } from "react-native";
import {
	SafeAreaInsetsContext,
	useSafeAreaInsets,
} from "react-native-safe-area-context";
import type { ReactNode } from "react";
import { useIsOnline } from "@/lib/network";
import { Colors, fontFamily, fontSize, spacing } from "@/lib/constants";

const BAR_HEIGHT = 22;

// Wraps the app so the offline banner sits in layout flow above the children
// when the device is offline. Overrides the safe-area inset for descendants so
// screens that pad by `insets.top` don't double-pad on top of the banner.
export function OfflineBanner({ children }: { children: ReactNode }) {
	const isOnline = useIsOnline();
	const insets = useSafeAreaInsets();

	const overrideInsets = isOnline
		? insets
		: { top: 0, right: insets.right, bottom: insets.bottom, left: insets.left };

	return (
		<View style={styles.root}>
			{!isOnline ? (
				<View
					style={[styles.bar, { paddingTop: insets.top }]}
					accessibilityRole="alert"
					accessibilityLiveRegion="polite"
				>
					<View style={styles.barContent}>
						<Text style={styles.text}>No internet connection</Text>
					</View>
				</View>
			) : null}
			<SafeAreaInsetsContext.Provider value={overrideInsets}>
				<View style={styles.content}>{children}</View>
			</SafeAreaInsetsContext.Provider>
		</View>
	);
}

const styles = StyleSheet.create({
	root: {
		flex: 1,
	},
	content: {
		flex: 1,
	},
	bar: {
		backgroundColor: Colors.muted,
	},
	barContent: {
		height: BAR_HEIGHT,
		alignItems: "center",
		justifyContent: "center",
		paddingHorizontal: spacing[3],
	},
	text: {
		fontSize: fontSize.xs,
		fontFamily: fontFamily.sansMedium,
		color: Colors.mutedForeground,
	},
});
