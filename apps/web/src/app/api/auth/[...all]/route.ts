import { auth } from "@/lib/auth";
import { toNextJsHandler } from "better-auth/next-js";

const handler = toNextJsHandler(auth);

// Node 24's undici uses private class fields (#state) which are inaccessible
// through JavaScript Proxy objects. Next.js wraps Request/Response in proxies,
// so we reconstruct plain objects before passing to better-auth and on return.
function unwrapRequest(req: Request): Request {
	return new Request(req.url, {
		method: req.method,
		headers: new Headers(req.headers),
		body: req.body,
		// @ts-expect-error -- required for streaming request bodies
		duplex: "half",
	});
}

export const GET = async (req: Request) => {
	const res = await handler.GET(unwrapRequest(req));
	return new Response(res.body, res);
};

export const POST = async (req: Request) => {
	const res = await handler.POST(unwrapRequest(req));
	return new Response(res.body, res);
};
