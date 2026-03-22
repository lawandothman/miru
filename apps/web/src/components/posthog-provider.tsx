"use client";

import posthog from "posthog-js";
import { PostHogProvider as PHProvider, usePostHog } from "posthog-js/react";
import { usePathname, useSearchParams } from "next/navigation";
import { Suspense, useEffect } from "react";
import { env } from "@/env";

if (typeof window !== "undefined" && env.NEXT_PUBLIC_POSTHOG_KEY) {
	posthog.init(env.NEXT_PUBLIC_POSTHOG_KEY, {
		api_host: "https://eu.i.posthog.com",
		person_profiles: "identified_only",
		capture_pageview: false,
		capture_pageleave: true,
	});
}

function PostHogPageview() {
	const pathname = usePathname();
	const searchParams = useSearchParams();
	const ph = usePostHog();

	useEffect(() => {
		if (pathname && ph) {
			let url = window.origin + pathname;
			const search = searchParams.toString();
			if (search) {
				url += `?${search}`;
			}
			ph.capture("$pageview", { $current_url: url });
		}
	}, [pathname, searchParams, ph]);

	return null;
}

export function PostHogIdentify({
	userId,
	properties,
}: {
	userId: string;
	properties?: Record<string, string | null>;
}) {
	const ph = usePostHog();

	useEffect(() => {
		ph.identify(userId, properties);
	}, [userId, properties, ph]);

	return null;
}

export function PostHogProvider({ children }: { children: React.ReactNode }) {
	if (!env.NEXT_PUBLIC_POSTHOG_KEY) {
		return <>{children}</>;
	}

	return (
		<PHProvider client={posthog}>
			<Suspense fallback={null}>
				<PostHogPageview />
			</Suspense>
			{children}
		</PHProvider>
	);
}
