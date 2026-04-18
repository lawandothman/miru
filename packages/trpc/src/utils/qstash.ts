import type { Database } from "@miru/db";
import { Client } from "@upstash/qstash";
import type { z } from "zod";

export type JobContext = {
	db: Database;
	expoAccessToken?: string;
	captureException?: (error: unknown, extra?: Record<string, unknown>) => void;
};

export type ParseAndHandleResult =
	| { success: true }
	| { success: false; error: z.ZodError };

export type AnyJob = {
	readonly name: string;
	parseAndHandle: (
		rawPayload: unknown,
		ctx: JobContext,
	) => Promise<ParseAndHandleResult>;
};

export type Job<TName extends string, TSchema extends z.ZodType> = AnyJob & {
	readonly name: TName;
	readonly schema: TSchema;
	handler: (payload: z.infer<TSchema>, ctx: JobContext) => Promise<void>;
	publish: (payload: z.infer<TSchema>) => Promise<boolean>;
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

export function defineJob<
	TName extends string,
	TSchema extends z.ZodType,
>(def: {
	name: TName;
	schema: TSchema;
	handler: (payload: z.infer<TSchema>, ctx: JobContext) => Promise<void>;
}): Job<TName, TSchema> {
	async function parseAndHandle(
		rawPayload: unknown,
		ctx: JobContext,
	): Promise<ParseAndHandleResult> {
		const parsed = def.schema.safeParse(rawPayload);
		if (!parsed.success) {
			return { success: false, error: parsed.error };
		}
		await def.handler(parsed.data, ctx);
		return { success: true };
	}

	return {
		name: def.name,
		schema: def.schema,
		handler: def.handler,
		parseAndHandle,
		async publish(payload) {
			const client = getClient();
			const appUrl = process.env["BETTER_AUTH_URL"];
			if (!client || !appUrl) return false;
			try {
				await client.publishJSON({
					url: `${appUrl}/api/jobs/${def.name}`,
					body: payload,
					retries: 3,
				});
				return true;
			} catch {
				return false;
			}
		},
	};
}
