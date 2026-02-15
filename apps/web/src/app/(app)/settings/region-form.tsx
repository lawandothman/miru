"use client";

import { useEffect, useState } from "react";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { trpc } from "@/lib/trpc/client";
import {
	COUNTRIES,
	countryFlag,
} from "@/app/(onboarding)/onboarding/steps/region-data";

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
			<div className="flex items-center justify-center py-4">
				<Spinner className="size-5 text-muted-foreground" />
			</div>
		);
	}

	const hasChanged = country !== (state?.country ?? "");

	return (
		<div className="space-y-4">
			<div className="flex items-center justify-between gap-4">
				<div className="space-y-1">
					<Label htmlFor="settings-country">Your region</Label>
					<p className="text-xs text-muted-foreground">
						Affects which streaming services are shown.
					</p>
				</div>
				<Select value={country} onValueChange={setCountry}>
					<SelectTrigger id="settings-country" className="w-48">
						<SelectValue placeholder="Select a region" />
					</SelectTrigger>
					<SelectContent>
						{COUNTRIES.map((entry) => (
							<SelectItem key={entry.code} value={entry.code}>
								<span className="mr-2">{countryFlag(entry.code)}</span>
								{entry.name}
							</SelectItem>
						))}
					</SelectContent>
				</Select>
			</div>
			{hasChanged && (
				<Button
					size="sm"
					className="w-full"
					onClick={() => setCountryMut.mutate({ country })}
					disabled={!country || setCountryMut.isPending}
				>
					{setCountryMut.isPending ? "Saving..." : "Save region"}
				</Button>
			)}
		</div>
	);
}
