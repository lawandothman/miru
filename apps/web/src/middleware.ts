import { proxy } from "./proxy";

export const middleware = proxy;

export const config = {
	matcher: ["/dashboard", "/watchlist", "/for-you"],
};
