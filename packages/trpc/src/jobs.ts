import { z } from "zod";
import {
	sendNewFollowerPushNotification,
	sendWatchlistMatchPushNotifications,
} from "./utils/expo-push";
import { type AnyJob, defineJob, type JobContext } from "./utils/qstash";

export type { JobContext };

export const newFollowerJob = defineJob({
	name: "new-follower",
	schema: z.object({
		followerId: z.string().min(1),
		followerName: z.string().min(1),
		userId: z.string().min(1),
	}),
	handler: async (payload, ctx) => {
		await sendNewFollowerPushNotification({
			...(ctx.captureException
				? { captureException: ctx.captureException }
				: {}),
			db: ctx.db,
			...(ctx.expoAccessToken ? { expoAccessToken: ctx.expoAccessToken } : {}),
			followerId: payload.followerId,
			followerName: payload.followerName,
			userId: payload.userId,
		});
	},
});

export const watchlistMatchJob = defineJob({
	name: "watchlist-match",
	schema: z.object({
		userId: z.string().min(1),
		userName: z.string().min(1),
		movieId: z.number().int().positive(),
	}),
	handler: async (payload, ctx) => {
		await sendWatchlistMatchPushNotifications({
			...(ctx.captureException
				? { captureException: ctx.captureException }
				: {}),
			db: ctx.db,
			...(ctx.expoAccessToken ? { expoAccessToken: ctx.expoAccessToken } : {}),
			movieId: payload.movieId,
			userId: payload.userId,
			userName: payload.userName,
		});
	},
});

const jobsByName = {
	[newFollowerJob.name]: newFollowerJob,
	[watchlistMatchJob.name]: watchlistMatchJob,
} as const;

export type JobName = keyof typeof jobsByName;

export function findJob(name: string): AnyJob | null {
	return jobsByName[name as JobName] ?? null;
}
