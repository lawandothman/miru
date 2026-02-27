function getApiUrl(): string {
	// When set (e.g. by dev:tunnel), use it as-is.
	const configured = process.env.EXPO_PUBLIC_API_URL;
	if (configured) {
		return configured;
	}

	// Default to localhost — works for simulators.
	// Physical devices need a tunnel (pnpm dev:tunnel) which sets EXPO_PUBLIC_API_URL.
	return "http://localhost:3000";
}

export const API_URL = getApiUrl();
