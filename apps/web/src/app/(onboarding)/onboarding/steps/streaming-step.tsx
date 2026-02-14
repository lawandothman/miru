"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Sparkles } from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { trpc } from "@/lib/trpc/client";
import { cn } from "@/lib/utils";
import { countryFlag, countryName } from "./region-data";

interface StreamingStepProps {
	selectedProviders: number[];
	country: string | null;
	onSelectionStateChange: (hasSelection: boolean) => void;
	onComplete: (providerIds: number[]) => void;
}

export function StreamingStep({
	selectedProviders,
	country,
	onSelectionStateChange,
	onComplete,
}: StreamingStepProps) {
	const [selected, setSelected] = useState<Set<number>>(
		new Set(selectedProviders),
	);
	const [search, setSearch] = useState("");

	const { data: providers, isLoading } = trpc.movie.getWatchProviders.useQuery();
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

	const filteredProviders = providers?.filter((provider) =>
		provider.name.toLowerCase().includes(search.toLowerCase()),
	);

	useEffect(() => {
		onSelectionStateChange(selected.size > 0);
	}, [onSelectionStateChange, selected]);

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
					Streaming setup
				</div>
				<h2 className="font-display text-2xl font-bold tracking-tight sm:text-3xl">
					Where do you stream?
				</h2>
				<p className="text-sm text-muted-foreground sm:text-base">
					Pick the services you use in {countryName(country)} {countryFlag(country ?? "GB")}
				</p>
			</div>

			<div className="space-y-2">
				<Label htmlFor="provider-search">Search services</Label>
				<Input
					id="provider-search"
					placeholder="Netflix, Prime Video..."
					value={search}
					onChange={(event) => setSearch(event.target.value)}
					className="h-11"
				/>
			</div>

			<p className="text-center text-xs text-muted-foreground">
				Choose as many services as you like.
			</p>

			{isLoading ? (
				<div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
					{Array.from({ length: 12 }, (_, i) => (
						<div key={i} className="h-24 animate-pulse rounded-2xl bg-muted" />
					))}
				</div>
			) : (
				<>
					<div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
						{filteredProviders?.map((provider) => {
							const isSelected = selected.has(provider.id);
							return (
								<button
									key={provider.id}
									type="button"
									onClick={() => toggle(provider.id)}
									className={cn(
										"flex h-24 flex-col items-center justify-center gap-2 rounded-2xl border p-3 text-center transition-all",
										isSelected
											? "border-amber-500/60 bg-amber-500/10"
											: "border-border/70 bg-card/40 hover:border-amber-500/40 hover:bg-card",
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
									<span className="line-clamp-1 text-xs font-medium">
										{provider.name}
									</span>
								</button>
							);
						})}
					</div>

					{filteredProviders?.length === 0 && (
						<div className="rounded-2xl border border-border/70 bg-card/40 px-4 py-8 text-center text-sm text-muted-foreground">
							No services matched your search.
						</div>
					)}
				</>
			)}

		</form>
	);
}
