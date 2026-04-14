import PostHog from "posthog-react-native";
import type { EventName, EventProperties } from "@miru/analytics";

const posthogKey = process.env["EXPO_PUBLIC_POSTHOG_KEY"];

export const posthog = posthogKey
	? new PostHog(posthogKey, {
			host: "https://eu.i.posthog.com",
			disabled: __DEV__,
			errorTracking: {
				autocapture: true,
			},
			enableSessionReplay: !__DEV__,
			sessionReplayConfig: {
				maskAllTextInputs: true,
				maskAllImages: false,
				captureNetworkTelemetry: true,
			},
		})
	: undefined;

export function capture<E extends EventName>(
	event: E,
	properties: EventProperties[E],
) {
	posthog?.capture(event, properties);
}
