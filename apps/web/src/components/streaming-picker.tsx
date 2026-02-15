"use client";

import Image from "next/image";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface Provider {
	id: number;
	name: string;
	logoPath: string | null;
}

interface StreamingPickerProps {
	providers: Provider[];
	selected: Set<number>;
	onToggle: (id: number) => void;
	search: string;
	onSearchChange: (value: string) => void;
	/** Compact mode for dialogs, full mode for onboarding */
	compact?: boolean;
	/** Enable staggered scale-in animation */
	animated?: boolean;
	/** Extra classes applied to the scrollable grid area (e.g. max-h, overflow) */
	gridClassName?: string;
}

export function StreamingPicker({
	providers,
	selected,
	onToggle,
	search,
	onSearchChange,
	compact = false,
	animated = false,
	gridClassName,
}: StreamingPickerProps) {
	const filtered = providers.filter((p) =>
		p.name.toLowerCase().includes(search.toLowerCase()),
	);

	return (
		<div className={compact ? "space-y-3" : "space-y-6"}>
			<div className="relative">
				<Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
				<Input
					placeholder="Netflix, Prime Video..."
					value={search}
					onChange={(e) => onSearchChange(e.target.value)}
					className={cn("pl-9", !compact && "h-11")}
				/>
			</div>

			<div className={gridClassName}>
				<div
					className={cn(
						"grid",
						compact
							? "grid-cols-3 gap-2 sm:grid-cols-4"
							: "grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4",
					)}
				>
					{filtered.map((provider, i) => {
						const isSelected = selected.has(provider.id);
						return (
							<button
								key={provider.id}
								type="button"
								onClick={() => onToggle(provider.id)}
								style={
									animated
										? { animationDelay: `${Math.min(i * 30, 500)}ms` }
										: undefined
								}
								className={cn(
									"flex flex-col items-center justify-center border text-center transition-all",
									animated && "animate-scale-in",
									compact
										? "gap-1.5 rounded-xl p-2.5"
										: "h-24 gap-2 rounded-2xl p-3",
									isSelected
										? "border-amber-500/60 bg-amber-500/10"
										: "border-border/70 bg-card/40 hover:border-amber-500/40 hover:bg-card",
								)}
							>
								{provider.logoPath ? (
									<Image
										src={`https://image.tmdb.org/t/p/w92${provider.logoPath}`}
										alt={provider.name}
										width={compact ? 32 : 40}
										height={compact ? 32 : 40}
										className="rounded-lg"
									/>
								) : (
									<div
										className={cn(
											"flex items-center justify-center rounded-lg bg-muted text-xs font-medium",
											compact ? "size-8" : "size-10",
										)}
									>
										{provider.name.charAt(0)}
									</div>
								)}
								<span
									className={cn(
										"line-clamp-1 font-medium leading-tight",
										compact ? "text-[11px]" : "text-xs",
									)}
								>
									{provider.name}
								</span>
							</button>
						);
					})}
				</div>

				{filtered.length === 0 && (
					<div
						className={cn(
							"text-center text-sm text-muted-foreground",
							compact
								? "py-6"
								: "rounded-2xl border border-border/70 bg-card/40 px-4 py-8",
						)}
					>
						No services matched your search.
					</div>
				)}
			</div>
		</div>
	);
}
