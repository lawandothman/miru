"use client";

import { useEffect, useRef } from "react";
import type { EventName, EventProperties } from "@miru/analytics";
import { capture } from "@/lib/analytics";

export function TrackEvent<E extends EventName>({
	event,
	properties,
}: {
	event: E;
	properties: EventProperties[E];
}) {
	const tracked = useRef(false);

	useEffect(() => {
		if (!tracked.current) {
			tracked.current = true;
			capture(event, properties);
		}
	});

	return null;
}
