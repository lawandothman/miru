export const COUNTRIES = [
	{ code: "US", name: "United States" },
	{ code: "GB", name: "United Kingdom" },
	{ code: "CA", name: "Canada" },
	{ code: "AU", name: "Australia" },
	{ code: "DE", name: "Germany" },
	{ code: "FR", name: "France" },
	{ code: "ES", name: "Spain" },
	{ code: "IT", name: "Italy" },
	{ code: "NL", name: "Netherlands" },
	{ code: "SE", name: "Sweden" },
	{ code: "NO", name: "Norway" },
	{ code: "DK", name: "Denmark" },
	{ code: "FI", name: "Finland" },
	{ code: "IE", name: "Ireland" },
	{ code: "PT", name: "Portugal" },
	{ code: "AT", name: "Austria" },
	{ code: "CH", name: "Switzerland" },
	{ code: "BE", name: "Belgium" },
	{ code: "PL", name: "Poland" },
	{ code: "BR", name: "Brazil" },
	{ code: "MX", name: "Mexico" },
	{ code: "AR", name: "Argentina" },
	{ code: "JP", name: "Japan" },
	{ code: "KR", name: "South Korea" },
	{ code: "IN", name: "India" },
	{ code: "NZ", name: "New Zealand" },
	{ code: "ZA", name: "South Africa" },
	{ code: "SG", name: "Singapore" },
	{ code: "AE", name: "UAE" },
	{ code: "HK", name: "Hong Kong" },
] as const;

export function countryFlag(code: string): string {
	return String.fromCodePoint(
		...code
			.toUpperCase()
			.split("")
			.map((char) => 127397 + char.charCodeAt(0)),
	);
}

const TIMEZONE_TO_COUNTRY: Record<string, string> = {
	"America/New_York": "US",
	"America/Chicago": "US",
	"America/Denver": "US",
	"America/Los_Angeles": "US",
	"America/Anchorage": "US",
	"Pacific/Honolulu": "US",
	"America/Phoenix": "US",
	"Europe/London": "GB",
	"America/Toronto": "CA",
	"America/Vancouver": "CA",
	"Australia/Sydney": "AU",
	"Australia/Melbourne": "AU",
	"Australia/Perth": "AU",
	"Europe/Berlin": "DE",
	"Europe/Paris": "FR",
	"Europe/Madrid": "ES",
	"Europe/Rome": "IT",
	"Europe/Amsterdam": "NL",
	"Europe/Stockholm": "SE",
	"Europe/Oslo": "NO",
	"Europe/Copenhagen": "DK",
	"Europe/Helsinki": "FI",
	"Europe/Dublin": "IE",
	"Europe/Lisbon": "PT",
	"Europe/Vienna": "AT",
	"Europe/Zurich": "CH",
	"Europe/Brussels": "BE",
	"Europe/Warsaw": "PL",
	"America/Sao_Paulo": "BR",
	"America/Mexico_City": "MX",
	"America/Argentina/Buenos_Aires": "AR",
	"Asia/Tokyo": "JP",
	"Asia/Seoul": "KR",
	"Asia/Kolkata": "IN",
	"Pacific/Auckland": "NZ",
	"Africa/Johannesburg": "ZA",
	"Asia/Singapore": "SG",
	"Asia/Dubai": "AE",
	"Asia/Hong_Kong": "HK",
};

export function detectCountryFromTimezone(): string | null {
	try {
		const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
		return TIMEZONE_TO_COUNTRY[tz] ?? null;
	} catch {
		return null;
	}
}
