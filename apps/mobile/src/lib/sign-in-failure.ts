/**
 * Classification for mobile sign-in failures.
 *
 * Apple's system sheet reports user cancellation as ERR_REQUEST_CANCELED and
 * an opaque failure as ERR_REQUEST_UNKNOWN. Those stay distinct: cancellation
 * is not an error, and the unknown result is still reported.
 *
 * Transport failures from expo/fetch keep the native message ("fetch failed:
 * java.net.SocketException: Connection reset") but drop the JS stack. Match
 * the transport text rather than treating every "fetch failed" as retryable —
 * an aborted request uses the same prefix.
 */

const APPLE_AUTH_CANCELLED = "ERR_REQUEST_CANCELED";
const FETCH_ABORTED = "ERR_FETCH_REQUEST_CANCELED";

const TRANSIENT_NETWORK =
	/socketexception|sockettimeoutexception|unknownhostexception|unable to resolve host|network request failed|failed to connect|connection reset|connection abort|connection closed|software caused connection abort|network is unreachable|econnreset|econnaborted|enotfound|eai_again|etimedout|err_network/i;

export type SignInFailureKind = "cancelled" | "network" | "authorization";

export type SignInFailure = {
	kind: SignInFailureKind;
	code?: string;
	/** Null only for intentional cancellation, which shows no alert. */
	message: string | null;
	report: boolean;
};

function errorText(error: unknown): string {
	if (typeof error === "string") {
		return error;
	}
	if (!error || typeof error !== "object") {
		return "";
	}
	const message =
		"message" in error && typeof error.message === "string"
			? error.message
			: "";
	const cause = "cause" in error ? error.cause : undefined;
	if (cause instanceof Error) {
		return `${message}\n${cause.message}`;
	}
	if (typeof cause === "string") {
		return `${message}\n${cause}`;
	}
	return message;
}

function readErrorCode(error: unknown): string | undefined {
	const code = codeFrom(error) ?? codeFrom(causeOf(error));
	if (!code || !/^[A-Za-z0-9_]{1,64}$/.test(code)) {
		return undefined;
	}
	return code;
}

function codeFrom(value: unknown): string | undefined {
	if (!value || typeof value !== "object" || !("code" in value)) {
		return undefined;
	}
	return typeof value.code === "string" ? value.code : undefined;
}

function causeOf(error: unknown): unknown {
	if (!error || typeof error !== "object" || !("cause" in error)) {
		return undefined;
	}
	return error.cause;
}

export function isTransientNetworkError(error: unknown): boolean {
	const code = readErrorCode(error);
	if (code === APPLE_AUTH_CANCELLED || code === FETCH_ABORTED) {
		return false;
	}
	return TRANSIENT_NETWORK.test(errorText(error));
}

export function classifySignInFailure(error: unknown): SignInFailure {
	const code = readErrorCode(error);
	if (code === APPLE_AUTH_CANCELLED) {
		return { kind: "cancelled", code, message: null, report: false };
	}

	if (isTransientNetworkError(error)) {
		return {
			kind: "network",
			code,
			message:
				"The connection was interrupted. Check your network and try again.",
			report: true,
		};
	}

	const text = errorText(error);
	if (
		code === "ERR_REQUEST_UNKNOWN" ||
		text.includes("The authorization attempt failed for an unknown reason")
	) {
		return {
			kind: "authorization",
			code: code ?? "ERR_REQUEST_UNKNOWN",
			message: "Apple couldn't complete sign-in. Please try again.",
			report: true,
		};
	}

	return {
		kind: "authorization",
		code,
		message: "Something went wrong. Please try again.",
		report: true,
	};
}

export type ForegroundLossFlag = {
	reset: () => void;
	stayedForeground: () => boolean;
	stop: () => void;
};

/**
 * Tracks whether an in-flight attempt left the foreground. The Expo auth
 * client opens the browser from inside the sign-in promise, which moves the
 * app to inactive/background. A later socket error must not start a second
 * browser session.
 */
export function createForegroundLossFlag(
	getState: () => string,
	subscribe: (listener: (state: string) => void) => () => void,
): ForegroundLossFlag {
	let lost = getState() !== "active";
	const unsubscribe = subscribe((state) => {
		if (state !== "active") {
			lost = true;
		}
	});
	return {
		reset() {
			lost = getState() !== "active";
		},
		stayedForeground() {
			return !lost;
		},
		stop() {
			unsubscribe();
		},
	};
}

const defaultSleep = (ms: number) =>
	new Promise<void>((resolve) => {
		setTimeout(resolve, ms);
	});

/**
 * One retry for a transport failure that happened while the app was still
 * foregrounded, so the auth browser was not presented. Other failures,
 * including Apple's unknown authorization result, propagate immediately.
 */
export async function retryTransientSignIn<T>(
	run: () => Promise<T>,
	options: {
		canRetry: () => boolean;
		delayMs?: number;
		sleep?: (ms: number) => Promise<void>;
	},
): Promise<T> {
	const delayMs = options.delayMs ?? 400;
	const sleep = options.sleep ?? defaultSleep;
	try {
		return await run();
	} catch (error) {
		if (!isTransientNetworkError(error) || !options.canRetry()) {
			throw error;
		}
		await sleep(delayMs);
		return await run();
	}
}
