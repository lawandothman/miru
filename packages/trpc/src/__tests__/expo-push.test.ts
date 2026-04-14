import { describe, expect, it } from "vitest";
import { buildBadgeAwarePushMessages } from "../utils/expo-push";

describe("buildBadgeAwarePushMessages", () => {
	it("includes the unread badge count for each recipient", () => {
		const messages = buildBadgeAwarePushMessages(
			[
				{ token: "ExponentPushToken[user-1-a]", userId: "user-1" },
				{ token: "ExponentPushToken[user-1-b]", userId: "user-1" },
				{ token: "ExponentPushToken[user-2]", userId: "user-2" },
			],
			new Map([
				["user-1", 3],
				["user-2", 1],
			]),
			(recipient) => ({
				title: "Notification",
				body: `For ${recipient.userId}`,
				data: { type: "test" },
				priority: "high",
				sound: "default",
			}),
		);

		expect(messages).toEqual([
			{
				to: "ExponentPushToken[user-1-a]",
				title: "Notification",
				body: "For user-1",
				data: { type: "test" },
				priority: "high",
				sound: "default",
				badge: 3,
			},
			{
				to: "ExponentPushToken[user-1-b]",
				title: "Notification",
				body: "For user-1",
				data: { type: "test" },
				priority: "high",
				sound: "default",
				badge: 3,
			},
			{
				to: "ExponentPushToken[user-2]",
				title: "Notification",
				body: "For user-2",
				data: { type: "test" },
				priority: "high",
				sound: "default",
				badge: 1,
			},
		]);
	});

	it("omits invalid badge counts", () => {
		const messages = buildBadgeAwarePushMessages(
			[
				{ token: "ExponentPushToken[user-1]", userId: "user-1" },
				{ token: "ExponentPushToken[user-2]", userId: "user-2" },
				{ token: "ExponentPushToken[user-3]", userId: "user-3" },
			],
			new Map([
				["user-1", 0],
				["user-2", Number.NaN],
				["user-3", -2],
			]),
			() => ({
				title: "Notification",
				body: "No badge",
			}),
		);

		expect(messages).toEqual([
			{
				to: "ExponentPushToken[user-1]",
				title: "Notification",
				body: "No badge",
			},
			{
				to: "ExponentPushToken[user-2]",
				title: "Notification",
				body: "No badge",
			},
			{
				to: "ExponentPushToken[user-3]",
				title: "Notification",
				body: "No badge",
			},
		]);
	});
});
