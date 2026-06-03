import { useRouter } from "expo-router";
import { useCallback } from "react";

export function useGoBack() {
	const router = useRouter();

	return useCallback(() => {
		if (router.canGoBack()) {
			router.back();
		} else {
			router.replace("/(tabs)");
		}
	}, [router]);
}
