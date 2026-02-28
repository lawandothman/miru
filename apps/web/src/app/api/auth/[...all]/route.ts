import { toNextJsHandler } from "better-auth/next-js";
import { auth } from "@/lib/auth";
import type { NextRequest } from "next/server";

const handler = toNextJsHandler(auth);

// Node 24's undici uses private fields (#state) on Request/Response.
// Next.js wraps requests in a Proxy which can't forward private field access.
// Converting to a plain Request sidesteps this incompatibility.
// See: https://github.com/nodejs/undici/issues/4290
function toPlainRequest(req: NextRequest): Request {
	const hasBody = req.method !== "GET" && req.method !== "HEAD";
	return new Request(req.url, {
		method: req.method,
		headers: new Headers(req.headers),
		...(hasBody && { body: req.body, duplex: "half" }),
	});
}

export function GET(req: NextRequest) {
	return handler.GET(toPlainRequest(req));
}

export function POST(req: NextRequest) {
	return handler.POST(toPlainRequest(req));
}
