import { Fragment, type ReactNode } from "react";
import { StyleSheet, Text, View } from "react-native";
import {
	SafeAreaInsetsContext,
	useSafeAreaInsets,
} from "react-native-safe-area-context";
import { useIsOnline } from "@/lib/network";
import { Colors, fontFamily, fontSize, spacing } from "@/lib/constants";

const BAR_HEIGHT = 22;

export function OfflineBanner({ children }: { children: ReactNode }) {
	const isOnline = useIsOnline();
	const insets = useSafeAreaInsets();

	if (isOnline) {
		return <Fragment>{children}</Fragment>;
	}

	const overrideInsets = {
		top: 0,
		right: insets.right,
		bottom: insets.bottom,
		left: insets.left,
	};

	return (
		<View style={styles.root}>
			<View
				style={[styles.bar, { paddingTop: insets.top }]}
				accessibilityRole="alert"
				accessibilityLiveRegion="polite"
			>
				<View style={styles.barContent}>
					<Text style={styles.text}>No internet connection</Text>
				</View>
			</View>
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
