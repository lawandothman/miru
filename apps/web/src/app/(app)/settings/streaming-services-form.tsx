"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc/client";
import { cn } from "@/lib/utils";

export function StreamingServicesForm() {
	const [selected, setSelected] = useState<Set<number>>(new Set());

	const { data: providers } = trpc.movie.getWatchProviders.useQuery();
	const { data: state, isLoading } = trpc.onboarding.getState.useQuery();

	const setServices = trpc.onboarding.setStreamingServices.useMutation({
		onSuccess: () => toast.success("Streaming services saved"),
		onError: () => toast.error("Failed to save streaming services"),
	});

	useEffect(() => {
		if (state?.providerIds) {
			setSelected(new Set(state.providerIds));
		}
	}, [state?.providerIds]);

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

	if (isLoading) {
		return (
			<div className="flex items-center justify-center py-8">
				<Loader2 className="size-5 animate-spin text-muted-foreground" />
			</div>
		);
	}

	return (
		<div className="space-y-4">
			<div className="flex flex-wrap gap-2">
				{providers?.map((provider) => {
					const isSelected = selected.has(provider.id);
					return (
						<button
							key={provider.id}
							type="button"
							onClick={() => toggle(provider.id)}
							className={cn(
								"flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm font-medium transition-all",
								isSelected
									? "border-primary bg-primary/10 text-primary"
									: "border-border hover:border-primary/50",
							)}
						>
							{provider.logoPath && (
								<Image
									src={`https://image.tmdb.org/t/p/w45${provider.logoPath}`}
									alt=""
									width={20}
									height={20}
									className="rounded"
								/>
							)}
							{provider.name}
						</button>
					);
				})}
			</div>
			<Button
				size="sm"
				onClick={() =>
					setServices.mutate({ providerIds: Array.from(selected) })
				}
				disabled={setServices.isPending}
			>
				{setServices.isPending ? "Saving..." : "Save services"}
			</Button>
		</div>
	);
}
