import { describe, expect, it, vi } from "vitest";
import {
	SIGN_IN_REQUEST_TIMEOUT_MS,
	SignInRequestTimeoutError,
	classifySignInFailure,
	createForegroundLossFlag,
	createSignInAttemptGate,
	preBrowserFetchOptions,
	retryTransientSignIn,
	runWithPreBrowserTimeout,
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

	it("reports a cancelled pre-browser fetch as a network interruption", () => {
		const failure = classifySignInFailure(
			coded(
				"fetch failed: The operation was aborted.",
				"ERR_FETCH_REQUEST_CANCELED",
			),
		);

		expect(failure.kind).toBe("network");
		expect(failure.report).toBe(true);
		expect(failure.code).toBe("ERR_FETCH_REQUEST_CANCELED");
		expect(failure.message).toBe(
			"The connection was interrupted. Check your network and try again.",
		);
	});

	it("reports an AbortError without turning it into a user cancellation", () => {
		const failure = classifySignInFailure(
			new DOMException("The operation was aborted.", "AbortError"),
		);

		expect(failure.kind).toBe("network");
		expect(failure.report).toBe(true);
		expect(failure.message).toMatch(/connection was interrupted/);
	});

	it("reports the native cancel message from a timed-out fetch", () => {
		const failure = classifySignInFailure(
			new Error("fetch failed: Fetch request has been canceled"),
		);

		expect(failure.kind).toBe("network");
		expect(failure.report).toBe(true);
		expect(failure.message).toBe(
			"The connection was interrupted. Check your network and try again.",
		);
	});

	it("treats a TLS handshake cut by the timeout as one interrupted attempt", () => {
		const error = new Error(
			"fetch failed: javax.net.ssl.SSLException: Unable to parse TLS packet header",
		);

		expect(classifySignInFailure(error).message).toBe(
			"The connection was interrupted. Check your network and try again.",
		);
		expect(classifySignInFailure(error).report).toBe(true);
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

	it("does not retry the native fetch-canceled timeout", async () => {
		let calls = 0;

		await expect(
			retryTransientSignIn(
				async () => {
					calls += 1;
					throw new Error("fetch failed: Fetch request has been canceled");
				},
				{ canRetry: () => true, sleep: async () => undefined },
			),
		).rejects.toThrow(/Fetch request has been canceled/);

		expect(calls).toBe(1);
	});

	it("does not retry a TLS failure from a cancelled handshake", async () => {
		let calls = 0;

		await expect(
			retryTransientSignIn(
				async () => {
					calls += 1;
					throw new Error(
						"fetch failed: javax.net.ssl.SSLException: Unable to parse TLS packet header, java.net.ConnectException: Failed to connect to api.example.test/203.0.113.5:443",
					);
				},
				{ canRetry: () => true, sleep: async () => undefined },
			),
		).rejects.toThrow(/TLS packet header/);

		expect(calls).toBe(1);
	});

	it("does not retry a timed-out pre-browser request", async () => {
		let calls = 0;

		await expect(
			retryTransientSignIn(
				async () => {
					calls += 1;
					throw new SignInRequestTimeoutError();
				},
				{ canRetry: () => true, sleep: async () => undefined },
			),
		).rejects.toBeInstanceOf(SignInRequestTimeoutError);

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

function manualTimer() {
	let queued: (() => void) | null = null;
	let delay: number | null = null;
	return {
		schedule(callback: () => void, ms: number) {
			queued = callback;
			delay = ms;
			return {
				cancel() {
					queued = null;
					delay = null;
				},
			};
		},
		fire() {
			const callback = queued;
			queued = null;
			delay = null;
			callback?.();
		},
		pendingMs() {
			return delay;
		},
	};
}

describe("pre-browser timeout", () => {
	it("uses a 10s bound that better-fetch applies only to the HTTP request", () => {
		expect(SIGN_IN_REQUEST_TIMEOUT_MS).toBe(10_000);
		expect(preBrowserFetchOptions()).toEqual({ timeout: 10_000 });
	});

	it("cancels a silent hang and does not open the auth browser", async () => {
		const timer = manualTimer();
		let browsers = 0;
		const pending = runWithPreBrowserTimeout(
			(signal) =>
				new Promise((_resolve, reject) => {
					signal.addEventListener("abort", () => {
						reject(
							new DOMException("The operation was aborted.", "AbortError"),
						);
					});
				}),
			async () => {
				browsers += 1;
				return "browser";
			},
			{ schedule: timer.schedule },
		);

		expect(timer.pendingMs()).toBe(SIGN_IN_REQUEST_TIMEOUT_MS);
		timer.fire();

		await expect(pending).rejects.toBeInstanceOf(SignInRequestTimeoutError);
		expect(browsers).toBe(0);
		expect(timer.pendingMs()).toBeNull();
	});

	it("does not abort the browser after the request has already completed", async () => {
		const timer = manualTimer();
		let releaseBrowser: () => void = () => undefined;
		const browser = new Promise<void>((resolve) => {
			releaseBrowser = resolve;
		});
		const pending = runWithPreBrowserTimeout(
			async () => "response",
			async () => {
				await browser;
				return "signed-in";
			},
			{ schedule: timer.schedule },
		);

		await Promise.resolve();
		await Promise.resolve();
		expect(timer.pendingMs()).toBeNull();
		timer.fire();
		releaseBrowser();

		await expect(pending).resolves.toBe("signed-in");
	});

	it("lets a slow request that finishes in time open the browser", async () => {
		const timer = manualTimer();
		let finish: (value: string) => void = () => undefined;
		const pending = runWithPreBrowserTimeout(
			() =>
				new Promise<string>((resolve) => {
					finish = resolve;
				}),
			async (response) => `browser:${response}`,
			{ schedule: timer.schedule },
		);

		finish("ok");
		await expect(pending).resolves.toBe("browser:ok");
		expect(timer.pendingMs()).toBeNull();
	});

	it("preserves a connection reset so the foreground retry can still run", async () => {
		const timer = manualTimer();
		const pending = runWithPreBrowserTimeout(
			async () => {
				throw new Error(
					"fetch failed: java.net.SocketException: Connection reset",
				);
			},
			async () => "browser",
			{ schedule: timer.schedule },
		);

		await expect(pending).rejects.toThrow(/Connection reset/);
		expect(timer.pendingMs()).toBeNull();
	});

	it("allows a new attempt after a timeout without overlapping the first", async () => {
		const gate = createSignInAttemptGate();
		expect(gate.tryEnter()).toBe(true);
		expect(gate.tryEnter()).toBe(false);

		const timer = manualTimer();
		let browsers = 0;
		const first = runWithPreBrowserTimeout(
			(signal) =>
				new Promise((_resolve, reject) => {
					signal.addEventListener("abort", () => {
						reject(
							new DOMException("The operation was aborted.", "AbortError"),
						);
					});
				}),
			async () => {
				browsers += 1;
			},
			{ schedule: timer.schedule },
		);
		timer.fire();
		await expect(first).rejects.toBeInstanceOf(SignInRequestTimeoutError);
		gate.leave();

		expect(gate.tryEnter()).toBe(true);
		const second = await runWithPreBrowserTimeout(
			async () => "response",
			async () => {
				browsers += 1;
				return "browser";
			},
			{ schedule: manualTimer().schedule },
		);
		expect(second).toBe("browser");
		expect(browsers).toBe(1);
		gate.leave();
	});
});
