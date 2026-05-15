import { Platform, Share } from "react-native";
import { capture } from "@/lib/analytics";

const INVITE_URL = "https://watchmiru.app";

export async function shareInviteLink(source: string) {
	const message = "Match watchlists with me on Miru";

	const result = await Share.share(
		Platform.OS === "ios"
			? { message, url: INVITE_URL }
			: { message: `${message}\n${INVITE_URL}` },
	);

	if (result.action === Share.sharedAction) {
		capture("invite_link_shared", { source });
	}

	return result;
}
