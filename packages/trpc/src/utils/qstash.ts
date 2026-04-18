import { Client } from "@upstash/qstash";

export type JobPayload =
	| {
			type: "new-follower";
			followerId: string;
			followerName: string;
			userId: string;
	  }
	| {
			type: "watchlist-match";
			userId: string;
			userName: string;
			movieId: number;
	  };

let cachedClient: Client | null = null;

function getClient() {
	const token = process.env["QSTASH_TOKEN"];
	if (!token) return null;
	if (!cachedClient) {
		const baseUrl = process.env["QSTASH_URL"];
		cachedClient = new Client({
			token,
			...(baseUrl ? { baseUrl } : {}),
		});
	}
	return cachedClient;
}

/**
 * Publish a job to QStash. Returns true on success.
 * On failure or missing config, returns false — callers should fall back to
 * inline execution to avoid losing work.
 */
export async function publishJob(payload: JobPayload): Promise<boolean> {
	const client = getClient();
	const appUrl = process.env["BETTER_AUTH_URL"];
	if (!client || !appUrl) return false;
	try {
		await client.publishJSON({
			url: `${appUrl}/api/jobs/${payload.type}`,
			body: payload,
			retries: 3,
		});
		return true;
	} catch {
		return false;
	}
}
