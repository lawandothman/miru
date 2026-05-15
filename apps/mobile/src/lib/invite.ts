import { Platform, Share } from "react-native";
import { capture } from "@/lib/analytics";

const WEB_BASE = "https://watchmiru.app";

export function getInviteUrl(userId: string): string {
	return `${WEB_BASE}/?ref=${encodeURIComponent(userId)}`;
}

export async function shareInviteLink(userId: string, source: string) {
	const url = getInviteUrl(userId);
	const message = "Match watchlists with me on Miru";

	const result = await Share.share(
		Platform.OS === "ios" ? { message, url } : { message: `${message}\n${url}` },
	);

	if (result.action === Share.sharedAction) {
		capture("invite_link_shared", { source });
	}

	return result;
}
