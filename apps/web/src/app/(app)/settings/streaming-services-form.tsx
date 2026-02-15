"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Pencil } from "lucide-react";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import {
	Drawer,
	DrawerContent,
	DrawerDescription,
	DrawerFooter,
	DrawerHeader,
	DrawerTitle,
} from "@/components/ui/drawer";
import { Spinner } from "@/components/ui/spinner";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";
import { trpc } from "@/lib/trpc/client";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export function StreamingServicesForm() {
	const [open, setOpen] = useState(false);
	const [selected, setSelected] = useState<Set<number>>(new Set());
	const isMobile = useIsMobile();

	const { data: providers } = trpc.movie.getWatchProviders.useQuery();
	const { data: state, isLoading } = trpc.onboarding.getState.useQuery();

	const setServices = trpc.onboarding.setStreamingServices.useMutation({
		onSuccess: () => {
			toast.success("Streaming services saved");
			setOpen(false);
		},
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
			<div className="flex items-center justify-center py-4">
				<Spinner className="size-5 text-muted-foreground" />
			</div>
		);
	}

	const selectedProviders =
		providers?.filter((p) => selected.has(p.id)) ?? [];

	const summary =
		selectedProviders.length === 0
			? "No services selected"
			: selectedProviders.length <= 3
				? selectedProviders.map((p) => p.name).join(", ")
				: `${selectedProviders
						.slice(0, 3)
						.map((p) => p.name)
						.join(", ")} + ${selectedProviders.length - 3} more`;

	const picker = (
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
	);

	const footer = (
		<Button
			onClick={() =>
				setServices.mutate({ providerIds: Array.from(selected) })
			}
			disabled={setServices.isPending}
		>
			{setServices.isPending ? "Saving..." : "Save services"}
		</Button>
	);

	return (
		<>
			<button
				type="button"
				onClick={() => setOpen(true)}
				className="flex w-full items-center justify-between gap-4 text-left"
			>
				{selectedProviders.length > 0 ? (
					<div className="flex min-w-0 flex-wrap items-center gap-1.5">
						{selectedProviders.map((p) =>
							p.logoPath ? (
								<Image
									key={p.id}
									src={`https://image.tmdb.org/t/p/w45${p.logoPath}`}
									alt={p.name}
									width={28}
									height={28}
									className="rounded-md"
								/>
							) : null,
						)}
					</div>
				) : (
					<p className="text-sm text-muted-foreground">{summary}</p>
				)}
				<Pencil className="size-4 shrink-0 text-muted-foreground" />
			</button>

			{isMobile ? (
				<Drawer open={open} onOpenChange={setOpen}>
					<DrawerContent>
						<DrawerHeader>
							<DrawerTitle>Streaming Services</DrawerTitle>
							<DrawerDescription className="sr-only">
								Select your streaming services
							</DrawerDescription>
						</DrawerHeader>
						<div className="overflow-y-auto px-4 pb-2">{picker}</div>
						<DrawerFooter>{footer}</DrawerFooter>
					</DrawerContent>
				</Drawer>
			) : (
				<Dialog open={open} onOpenChange={setOpen}>
					<DialogContent showCloseButton>
						<DialogHeader>
							<DialogTitle>Streaming Services</DialogTitle>
							<DialogDescription className="sr-only">
								Select your streaming services
							</DialogDescription>
						</DialogHeader>
						{picker}
						<DialogFooter>{footer}</DialogFooter>
					</DialogContent>
				</Dialog>
			)}
		</>
	);
}
