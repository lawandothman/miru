import { describe, expect, it, vi } from "vitest";
import {
	classifySignInFailure,
	createForegroundLossFlag,
	retryTransientSignIn,
} from "./sign-in-failure";

function coded(message: string, code: string): Error {
	return Object.assign(new Error(message), { code });
}

describe("classifySignInFailure", () => {
	it("treats Apple cancellation as distinct from a failure", () => {
		const failure = classifySignInFailure(
			coded(
				"The user canceled the authorization attempt",
				"ERR_REQUEST_CANCELED",
			),
		);

		expect(failure).toEqual({
			kind: "cancelled",
			code: "ERR_REQUEST_CANCELED",
			message: null,
			report: false,
		});
	});

	it("keeps Apple's unknown authorization result as a reported failure", () => {
		const failure = classifySignInFailure(
			coded(
				"The authorization attempt failed for an unknown reason",
				"ERR_REQUEST_UNKNOWN",
			),
		);

		expect(failure.kind).toBe("authorization");
		expect(failure.report).toBe(true);
		expect(failure.code).toBe("ERR_REQUEST_UNKNOWN");
		expect(failure.message).toBe(
			"Apple couldn't complete sign-in. Please try again.",
		);
	});

	it("recognizes the unknown authorization message when the native code is missing", () => {
		const failure = classifySignInFailure(
			new Error("The authorization attempt failed for an unknown reason"),
		);

		expect(failure.kind).toBe("authorization");
		expect(failure.report).toBe(true);
		expect(failure.code).toBe("ERR_REQUEST_UNKNOWN");
	});

	it("classifies a connection reset as a reported network interruption", () => {
		const failure = classifySignInFailure(
			new Error("fetch failed: java.net.SocketException: Connection reset"),
		);

		expect(failure.kind).toBe("network");
		expect(failure.report).toBe(true);
		expect(failure.message).toBe(
			"The connection was interrupted. Check your network and try again.",
		);
	});

	it("classifies a DNS failure as a network interruption", () => {
		const failure = classifySignInFailure(
			new Error(
				'fetch failed: java.net.UnknownHostException: Unable to resolve host "api.example.test": No address associated with hostname',
			),
		);

		expect(failure.kind).toBe("network");
		expect(failure.report).toBe(true);
	});

	it("does not treat an aborted fetch as a transient network error", () => {
		const failure = classifySignInFailure(
			coded(
				"fetch failed: The operation was aborted.",
				"ERR_FETCH_REQUEST_CANCELED",
			),
		);

		expect(failure.kind).toBe("authorization");
		expect(failure.report).toBe(true);
		expect(failure.message).toBe("Something went wrong. Please try again.");
	});

	it("drops error codes that are not a short identifier", () => {
		const failure = classifySignInFailure(
			coded(
				"Something went wrong",
				"https://user:secret@api.example.test/callback",
			),
		);

		expect(failure.code).toBeUndefined();
		expect(failure.report).toBe(true);
	});
});

describe("retryTransientSignIn", () => {
	it("retries one foreground connection reset and then succeeds", async () => {
		let calls = 0;
		const sleep = vi.fn(async () => undefined);

		const result = await retryTransientSignIn(
			async () => {
				calls += 1;
				if (calls === 1) {
					throw new Error(
						"fetch failed: java.net.SocketException: Connection reset",
					);
				}
				return "session";
			},
			{ canRetry: () => true, delayMs: 400, sleep },
		);

		expect(result).toBe("session");
		expect(calls).toBe(2);
		expect(sleep).toHaveBeenCalledOnce();
		expect(sleep).toHaveBeenCalledWith(400);
	});

	it("does not retry once the attempt has left the foreground", async () => {
		let calls = 0;

		await expect(
			retryTransientSignIn(
				async () => {
					calls += 1;
					throw new Error(
						'fetch failed: java.net.UnknownHostException: Unable to resolve host "api.example.test"',
					);
				},
				{ canRetry: () => false, sleep: async () => undefined },
			),
		).rejects.toThrow(/UnknownHostException/);

		expect(calls).toBe(1);
	});

	it("does not retry an Apple authorization failure", async () => {
		let calls = 0;

		await expect(
			retryTransientSignIn(
				async () => {
					calls += 1;
					throw coded(
						"The authorization attempt failed for an unknown reason",
						"ERR_REQUEST_UNKNOWN",
					);
				},
				{ canRetry: () => true, sleep: async () => undefined },
			),
		).rejects.toThrow(/unknown reason/);

		expect(calls).toBe(1);
	});

	it("does not retry cancellation", async () => {
		let calls = 0;

		await expect(
			retryTransientSignIn(
				async () => {
					calls += 1;
					throw coded("canceled", "ERR_REQUEST_CANCELED");
				},
				{ canRetry: () => true, sleep: async () => undefined },
			),
		).rejects.toThrow(/canceled/);

		expect(calls).toBe(1);
	});

	it("does not attempt a third call when the retry also fails", async () => {
		let calls = 0;

		await expect(
			retryTransientSignIn(
				async () => {
					calls += 1;
					throw new Error(
						"fetch failed: java.net.SocketException: Connection reset",
					);
				},
				{ canRetry: () => true, sleep: async () => undefined },
			),
		).rejects.toThrow(/Connection reset/);

		expect(calls).toBe(2);
	});
});

describe("createForegroundLossFlag", () => {
	it("flips when the app leaves the foreground and resets on the next attempt", () => {
		let state = "active";
		let listener: (state: string) => void = () => undefined;
		const flag = createForegroundLossFlag(
			() => state,
			(next) => {
				listener = next;
				return () => undefined;
			},
		);

		expect(flag.stayedForeground()).toBe(true);
		listener("background");
		expect(flag.stayedForeground()).toBe(false);

		state = "active";
		flag.reset();
		expect(flag.stayedForeground()).toBe(true);
		listener("inactive");
		expect(flag.stayedForeground()).toBe(false);
		flag.stop();
	});

	it("starts lost when sign-in begins in the background", () => {
		const flag = createForegroundLossFlag(
			() => "background",
			() => () => undefined,
		);

		expect(flag.stayedForeground()).toBe(false);
		flag.stop();
	});
});
