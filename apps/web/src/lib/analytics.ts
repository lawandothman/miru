import posthog from "posthog-js";
import type { EventName, EventProperties } from "@miru/analytics";

export function capture<E extends EventName>(
	event: E,
	properties: EventProperties[E],
) {
	posthog.capture(event, properties);
}
