import { Colors, fontFamily } from "@/lib/constants";

export const defaultHeaderOptions = {
	headerShown: true,
	headerBackTitle: "",
	headerStyle: { backgroundColor: Colors.background },
	headerTintColor: Colors.foreground,
	headerTitleStyle: { fontFamily: fontFamily.displayBold },
} as const;
