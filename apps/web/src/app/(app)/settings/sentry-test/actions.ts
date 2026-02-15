"use server";

export async function triggerServerActionError() {
	await Promise.resolve();
	throw new Error("Sentry Test: Server Action error");
}
