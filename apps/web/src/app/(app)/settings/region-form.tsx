"use client";

import { useState } from "react";
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
	const { data: state, isLoading } = trpc.onboarding.getState.useQuery();

	const [country, setCountry] = useState(state?.country ?? "");

	const setCountryMut = trpc.onboarding.setCountry.useMutation({
		onSuccess: () => toast.success("Region saved"),
		onError: () => toast.error("Failed to save region"),
	});

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
			<div className="space-y-2">
				<Label htmlFor="settings-country">Your region</Label>
				<Select value={country} onValueChange={setCountry}>
					<SelectTrigger id="settings-country" className="w-full">
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
				<p className="text-xs text-muted-foreground">
					This affects which streaming services are shown for movies.
				</p>
			</div>
			{hasChanged && (
				<div className="flex justify-end">
					<Button
						size="sm"
						onClick={() => setCountryMut.mutate({ country })}
						disabled={!country || setCountryMut.isPending}
					>
						{setCountryMut.isPending ? "Saving..." : "Save region"}
					</Button>
				</div>
			)}
		</div>
	);
}
