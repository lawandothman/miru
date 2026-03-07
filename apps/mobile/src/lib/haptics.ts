import * as Haptics from "expo-haptics";

function fire(promise: Promise<void>) {
	promise.catch(() => undefined);
}

export function triggerWatchlistHaptic() {
	fire(Haptics.selectionAsync());
}

export function triggerFollowHaptic() {
	fire(Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light));
}

export function triggerRefreshHaptic() {
	fire(Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium));
}

export function triggerStepCompleteHaptic() {
	fire(Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success));
}
