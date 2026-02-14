"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { trpc } from "@/lib/trpc/client";
import { cn } from "@/lib/utils";

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

const COUNTRIES = [
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
];

function detectCountry(): string {
	try {
		const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
		return TIMEZONE_TO_COUNTRY[tz] ?? "GB";
	} catch {
		return "GB";
	}
}

interface StreamingStepProps {
	selectedProviders: number[];
	initialCountry: string | null;
	onComplete: (providerIds: number[], country: string) => void;
}

export function StreamingStep({
	selectedProviders,
	initialCountry,
	onComplete,
}: StreamingStepProps) {
	const [country, setCountry] = useState(
		initialCountry ?? detectCountry(),
	);
	const [selected, setSelected] = useState<Set<number>>(
		new Set(selectedProviders),
	);
	const [search, setSearch] = useState("");

	const { data: providers, isLoading } =
		trpc.movie.getWatchProviders.useQuery();

	const setServices = trpc.onboarding.setStreamingServices.useMutation();
	const setCountryMut = trpc.onboarding.setCountry.useMutation();

	useEffect(() => {
		if (!initialCountry) {
			setCountry(detectCountry());
		}
	}, [initialCountry]);

	const toggle = (id: number) => {
		setSelected((prev) => {
			const next = new Set(prev);
			if (next.has(id)) {
				next.delete(id);
			} else {
				next.add(id);
			}
			return next;
		});
	};

	const handleNext = async () => {
		try {
			await Promise.all([
				setServices.mutateAsync({ providerIds: Array.from(selected) }),
				setCountryMut.mutateAsync({ country }),
			]);
			onComplete(Array.from(selected), country);
		} catch {
			toast.error("Failed to save streaming services");
		}
	};

	const isPending = setServices.isPending || setCountryMut.isPending;

	const filteredProviders = providers?.filter((p) =>
		p.name.toLowerCase().includes(search.toLowerCase()),
	);

	return (
		<div className="space-y-6">
			<div className="space-y-2 text-center">
				<h2 className="font-display text-2xl font-bold tracking-tight">
					Where do you stream?
				</h2>
				<p className="text-sm text-muted-foreground">
					Select your streaming services so we can show what's available to
					you.
				</p>
			</div>

			<div className="space-y-2">
				<Label htmlFor="country">Your region</Label>
				<select
					id="country"
					value={country}
					onChange={(e) => setCountry(e.target.value)}
					className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
				>
					{COUNTRIES.map((c) => (
						<option key={c.code} value={c.code}>
							{c.name}
						</option>
					))}
				</select>
			</div>

			{isLoading ? (
				<div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
					{Array.from({ length: 8 }, (_, i) => (
						<div
							key={i}
							className="h-20 animate-pulse rounded-xl bg-muted"
						/>
					))}
				</div>
			) : (
				<>
					{providers && providers.length > 8 && (
						<Input
							placeholder="Search services..."
							value={search}
							onChange={(e) => setSearch(e.target.value)}
						/>
					)}
					<div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
						{filteredProviders?.map((provider) => {
							const isSelected = selected.has(provider.id);
							return (
								<button
									key={provider.id}
									type="button"
									onClick={() => toggle(provider.id)}
									className={cn(
										"flex flex-col items-center gap-2 rounded-xl border p-3 transition-all",
										isSelected
											? "border-primary bg-primary/10"
											: "border-border bg-card hover:border-primary/50",
									)}
								>
									{provider.logoPath ? (
										<Image
											src={`https://image.tmdb.org/t/p/w92${provider.logoPath}`}
											alt={provider.name}
											width={40}
											height={40}
											className="rounded-lg"
										/>
									) : (
										<div className="flex size-10 items-center justify-center rounded-lg bg-muted text-xs font-medium">
											{provider.name.charAt(0)}
										</div>
									)}
									<span className="text-xs font-medium line-clamp-1">
										{provider.name}
									</span>
								</button>
							);
						})}
					</div>
				</>
			)}

			<Button
				onClick={handleNext}
				disabled={isPending}
				className="w-full"
				size="lg"
			>
				{isPending ? "Saving..." : "Next"}
			</Button>
		</div>
	);
}
