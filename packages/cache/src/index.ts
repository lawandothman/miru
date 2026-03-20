import { Redis } from "@upstash/redis";

export interface Cache {
	get<T>(key: string): Promise<T | null>;
	set<T>(key: string, value: T, ttlSeconds: number): Promise<void>;
	del(...keys: string[]): Promise<void>;
	getOrSet<T>(
		key: string,
		ttlSeconds: number,
		fn: () => Promise<T>,
	): Promise<T>;
}

export function createCache(opts: { url: string; token: string }): Cache {
	const redis = new Redis({ url: opts.url, token: opts.token });

	return {
		async get<T>(key: string): Promise<T | null> {
			try {
				return await redis.get<T>(key);
			} catch {
				return null;
			}
		},

		async set<T>(key: string, value: T, ttlSeconds: number): Promise<void> {
			try {
				await redis.set(key, value, { ex: ttlSeconds });
			} catch {
				// Cache write failure is non-critical
			}
		},

		async del(...keys: string[]): Promise<void> {
			try {
				if (keys.length > 0) {
					await redis.del(...keys);
				}
			} catch {
				// Cache delete failure is non-critical
			}
		},

		async getOrSet<T>(
			key: string,
			ttlSeconds: number,
			fn: () => Promise<T>,
		): Promise<T> {
			try {
				const cached = await redis.get<T>(key);
				if (cached !== null) {
					return cached;
				}
			} catch {
				// Fall through to fn
			}

			const value = await fn();

			try {
				await redis.set(key, value, { ex: ttlSeconds });
			} catch {
				// Cache write failure is non-critical
			}

			return value;
		},
	};
}

export const TTL = {
	RECOMMENDATIONS: 900,
	SEARCH: 3600,
	GENRES: 3600,
	DISCOVER_SECTIONS: 300,
} as const;

export const keys = {
	genres: () => "miru:genres",
	discoverSections: () => "miru:discover:sections",
	search: (query: string, page: number) =>
		`miru:search:${hashKey(query.toLowerCase().trim())}:p${page}`,
	discover: (params: Record<string, unknown>) =>
		`miru:discover:${hashKey(JSON.stringify(params))}`,
	recommendations: (userId: string) => `miru:recs:${userId}`,
} as const;

function hashKey(input: string): string {
	let hash = 0;
	for (let i = 0; i < input.length; i++) {
		hash = ((hash << 5) - hash + input.charCodeAt(i)) | 0;
	}
	return (hash >>> 0).toString(36);
}
