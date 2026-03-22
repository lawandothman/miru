import { useEffect } from "react";
import { usePathname } from "expo-router";
import { usePostHog } from "posthog-react-native";

export function useScreenTracking() {
	const pathname = usePathname();
	const posthog = usePostHog();

	useEffect(() => {
		if (pathname && posthog) {
			posthog.screen(pathname);
		}
	}, [pathname, posthog]);
}
