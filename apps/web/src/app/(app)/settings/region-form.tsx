"use client";

import { useEffect, useState } from "react";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { trpc } from "@/lib/trpc/client";

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

export function RegionForm() {
	const [country, setCountry] = useState("");

	const { data: state, isLoading } = trpc.onboarding.getState.useQuery();

	const setCountryMut = trpc.onboarding.setCountry.useMutation({
		onSuccess: () => toast.success("Region saved"),
		onError: () => toast.error("Failed to save region"),
	});

	useEffect(() => {
		if (state?.country) {
			setCountry(state.country);
		}
	}, [state?.country]);

	if (isLoading) {
		return (
			<div className="flex items-center justify-center py-8">
				<Spinner className="size-5 text-muted-foreground" />
			</div>
		);
	}

	return (
		<div className="space-y-4">
			<div className="space-y-2">
				<Label htmlFor="settings-country">Your region</Label>
				<select
					id="settings-country"
					value={country}
					onChange={(e) => setCountry(e.target.value)}
					className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
				>
					<option value="">Select a region</option>
					{COUNTRIES.map((c) => (
						<option key={c.code} value={c.code}>
							{c.name}
						</option>
					))}
				</select>
				<p className="text-xs text-muted-foreground">
					This affects which streaming services are shown for movies.
				</p>
			</div>
			<Button
				size="sm"
				onClick={() => setCountryMut.mutate({ country })}
				disabled={!country || setCountryMut.isPending}
			>
				{setCountryMut.isPending ? "Saving..." : "Save region"}
			</Button>
		</div>
	);
}
