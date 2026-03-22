import PostHog from "posthog-react-native";

const posthogKey = process.env["EXPO_PUBLIC_POSTHOG_KEY"];

export const posthog = posthogKey
	? new PostHog(posthogKey, {
			host: "https://eu.i.posthog.com",
			disabled: __DEV__,
		})
	: undefined;
