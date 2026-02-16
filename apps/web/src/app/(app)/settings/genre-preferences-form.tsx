"use client";

import { useState } from "react";
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
import { GenrePicker } from "@/components/genre-picker";
import { useIsMobile } from "@/hooks/use-mobile";
import { trpc } from "@/lib/trpc/client";
import { toast } from "sonner";

export function GenrePreferencesForm() {
	const isMobile = useIsMobile();

	const { data: genres } = trpc.movie.getGenres.useQuery();
	const { data: state, isLoading } = trpc.onboarding.getState.useQuery();

	const [open, setOpen] = useState(false);
	const [selected, setSelected] = useState(
		() => new Set(state?.genreIds ?? []),
	);

	const setPrefs = trpc.onboarding.setGenrePreferences.useMutation({
		onSuccess: () => {
			toast.success("Genre preferences saved");
			setOpen(false);
		},
		onError: () => toast.error("Failed to save preferences"),
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

	if (isLoading) {
		return (
			<div className="flex items-center justify-center py-4">
				<Spinner className="size-5 text-muted-foreground" />
			</div>
		);
	}

	const selectedGenres =
		genres?.filter((g) => selected.has(g.id)).map((g) => g.name) ?? [];

	const summary =
		selectedGenres.length === 0
			? "No genres selected"
			: selectedGenres.length <= 3
				? selectedGenres.join(", ")
				: `${selectedGenres.slice(0, 3).join(", ")} + ${selectedGenres.length - 3} more`;

	const picker = genres ? (
		<GenrePicker
			genres={genres}
			selected={selected}
			onToggle={toggle}
			compact
		/>
	) : null;

	const footer = (
		<Button
			onClick={() => setPrefs.mutate({ genreIds: Array.from(selected) })}
			disabled={selected.size === 0 || setPrefs.isPending}
		>
			{setPrefs.isPending ? "Saving..." : "Save preferences"}
		</Button>
	);

	return (
		<>
			<button
				type="button"
				onClick={() => setOpen(true)}
				className="flex w-full items-center justify-between gap-4 text-left"
			>
				<p className="min-w-0 truncate text-sm text-muted-foreground">
					{summary}
				</p>
				<Pencil className="size-4 shrink-0 text-muted-foreground" />
			</button>

			{isMobile ? (
				<Drawer open={open} onOpenChange={setOpen}>
					<DrawerContent>
						<DrawerHeader>
							<DrawerTitle>Genre Preferences</DrawerTitle>
							<DrawerDescription className="sr-only">
								Select your favourite genres
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
							<DialogTitle>Genre Preferences</DialogTitle>
							<DialogDescription className="sr-only">
								Select your favourite genres
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
