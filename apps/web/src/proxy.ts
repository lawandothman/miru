import { type NextRequest, NextResponse } from "next/server";
import { getSessionCookie } from "better-auth/cookies";

export function proxy(request: NextRequest) {
	const sessionCookie = getSessionCookie(request);
	if (!sessionCookie) {
		return NextResponse.redirect(new URL("/signin", request.url));
	}
	return NextResponse.next();
}

export const config = {
	matcher: ["/dashboard", "/watchlist", "/for-you"],
};
