"use client";

import { useState } from "react";
import { Globe2, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { trpc } from "@/lib/trpc/client";
import { COUNTRIES, countryFlag, detectCountry } from "./region-data";

interface RegionStepProps {
	initialCountry: string | null;
	onComplete: (country: string) => void;
}

export function RegionStep({ initialCountry, onComplete }: RegionStepProps) {
	const [country, setCountry] = useState(initialCountry ?? detectCountry());

	const setCountryMut = trpc.onboarding.setCountry.useMutation({
		onError: () => toast.error("Failed to save region"),
		onSuccess: () => onComplete(country),
	});

	return (
		<form
			id="onboarding-region-form"
			onSubmit={(event) => {
				event.preventDefault();
				setCountryMut.mutate({ country });
			}}
			className="space-y-8"
		>
			<div className="space-y-3 text-center">
				<div className="inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-xs font-medium text-amber-200">
					<Sparkles className="size-3.5" />
					Welcome to Miru
				</div>
				<h2 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">
					Where are you watching from?
				</h2>
				<p className="text-sm text-muted-foreground sm:text-base">
					This helps us show what&apos;s streaming near you.
				</p>
			</div>

			<div className="rounded-2xl border border-border/70 bg-card/40 p-4 sm:p-5">
				<div className="space-y-2">
					<Label htmlFor="onboarding-region">Your region</Label>
					<Select value={country} onValueChange={setCountry}>
						<SelectTrigger id="onboarding-region" className="h-12 rounded-xl">
							<SelectValue placeholder="Select your region" />
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

				<div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
					<Globe2 className="size-3.5" />
					You can change this later in Settings.
				</div>
			</div>
		</form>
	);
}
