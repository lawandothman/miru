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

const TIMEZONE_TO_COUNTRY: Record<string, string> = {
	"America/New_York": "US",
	"America/Chicago": "US",
	"America/Denver": "US",
	"America/Los_Angeles": "US",
	"America/Anchorage": "US",
	"America/Toronto": "CA",
	"America/Vancouver": "CA",
	"Europe/London": "GB",
	"Europe/Dublin": "IE",
	"Europe/Paris": "FR",
	"Europe/Berlin": "DE",
	"Europe/Madrid": "ES",
	"Europe/Rome": "IT",
	"Europe/Amsterdam": "NL",
	"Europe/Brussels": "BE",
	"Europe/Zurich": "CH",
	"Europe/Vienna": "AT",
	"Europe/Stockholm": "SE",
	"Europe/Oslo": "NO",
	"Europe/Copenhagen": "DK",
	"Europe/Helsinki": "FI",
	"Europe/Warsaw": "PL",
	"Europe/Lisbon": "PT",
	"Australia/Sydney": "AU",
	"Australia/Melbourne": "AU",
	"Pacific/Auckland": "NZ",
	"Asia/Tokyo": "JP",
	"Asia/Seoul": "KR",
	"Asia/Shanghai": "CN",
	"Asia/Hong_Kong": "HK",
	"Asia/Singapore": "SG",
	"Asia/Kolkata": "IN",
	"Asia/Dubai": "AE",
	"America/Sao_Paulo": "BR",
	"America/Mexico_City": "MX",
	"America/Argentina/Buenos_Aires": "AR",
	"Africa/Johannesburg": "ZA",
};

export function detectCountry(): string {
	try {
		const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
		return TIMEZONE_TO_COUNTRY[tz] ?? "GB";
	} catch {
		return "GB";
	}
}

export function countryFlag(code: string): string {
	return String.fromCodePoint(
		...code
			.toUpperCase()
			.split("")
			.map((char) => 127397 + char.charCodeAt(0)),
	);
}

export function countryName(code: string | null): string {
	if (!code) {
		return "your region";
	}

	return COUNTRIES.find((country) => country.code === code)?.name ?? code;
}
