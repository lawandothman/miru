"use client";

import { useState } from "react";
import { Sparkles } from "lucide-react";
import { toast } from "sonner";
import { StreamingPicker } from "@/components/streaming-picker";
import { trpc } from "@/lib/trpc/client";
import { countryFlag, countryName } from "./region-data";

interface StreamingStepProps {
	selectedProviders: number[];
	country: string | null;
	onComplete: (providerIds: number[]) => void;
}

export function StreamingStep({
	selectedProviders,
	country,
	onComplete,
}: StreamingStepProps) {
	const [selected, setSelected] = useState<Set<number>>(
		new Set(selectedProviders),
	);
	const [search, setSearch] = useState("");

	const { data: providers, isLoading } =
		trpc.movie.getWatchProviders.useQuery();
	const setServices = trpc.onboarding.setStreamingServices.useMutation({
		onError: () => toast.error("Failed to save streaming services"),
		onSuccess: () => onComplete(Array.from(selected)),
	});

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

	return (
		<form
			id="onboarding-streaming-form"
			onSubmit={(event) => {
				event.preventDefault();
				setServices.mutate({ providerIds: Array.from(selected) });
			}}
			className="space-y-6"
		>
			<div className="space-y-3 text-center">
				<div className="inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-xs font-medium text-amber-200">
					<Sparkles className="size-3.5" />
					Your services
				</div>
				<h2 className="font-display text-2xl font-bold tracking-tight sm:text-3xl">
					Where do you stream?
				</h2>
				<p className="text-sm text-muted-foreground sm:text-base">
					Select the services you subscribe to in {countryName(country)}{" "}
					{countryFlag(country ?? "GB")}
				</p>
			</div>

			{isLoading ? (
				<div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
					{Array.from({ length: 12 }, (_, i) => (
						<div key={i} className="h-24 animate-pulse rounded-2xl bg-muted" />
					))}
				</div>
			) : (
				<StreamingPicker
					providers={providers ?? []}
					selected={selected}
					onToggle={toggle}
					search={search}
					onSearchChange={setSearch}
					animated
				/>
			)}
		</form>
	);
}
