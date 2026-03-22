import { useEffect } from "react";
import { usePathname } from "expo-router";
import { posthog } from "@/lib/analytics";

export function useScreenTracking() {
	const pathname = usePathname();

	useEffect(() => {
		if (pathname && posthog) {
			posthog.screen(pathname);
		}
	}, [pathname]);
}
