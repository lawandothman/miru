import { useEffect, useState } from "react";
import {
	addNetworkStateListener,
	getNetworkStateAsync,
	type NetworkState,
} from "expo-network";

const POLL_INTERVAL_MS = 4000;

// expo-network's listener can miss state changes on iOS Simulator (and
// occasionally on real devices). Poll as a backstop so the banner clears when
// the connection comes back.
export function useIsOnline(): boolean {
	const [state, setState] = useState<NetworkState>({});

	useEffect(() => {
		let cancelled = false;

		function apply(next: NetworkState) {
			if (!cancelled) {
				setState(next);
			}
		}

		getNetworkStateAsync().then(apply).catch(() => undefined);

		const subscription = addNetworkStateListener(apply);
		const interval = setInterval(() => {
			getNetworkStateAsync().then(apply).catch(() => undefined);
		}, POLL_INTERVAL_MS);

		return () => {
			cancelled = true;
			subscription.remove();
			clearInterval(interval);
		};
	}, []);

	return state.isInternetReachable !== false;
}
