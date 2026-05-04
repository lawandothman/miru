import { useNetworkState } from "expo-network";

export function useIsOnline(): boolean {
	const state = useNetworkState();
	return state.isInternetReachable !== false;
}
