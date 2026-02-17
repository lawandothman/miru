"use client";

import { useState } from "react";
import {
	Calendar,
	Check,
	ChevronDown,
	Film,
	PlusCircle,
	X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { genreIcons } from "@/components/genre-picker";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import {
	Command,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandList,
	CommandSeparator,
} from "@/components/ui/command";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";

const CURRENT_YEAR = new Date().getFullYear();
const YEAR_OPTIONS = Array.from(
	{ length: CURRENT_YEAR - 1950 + 1 },
	(_, i) => CURRENT_YEAR - i,
);

interface YearRange {
	from: number | undefined;
	to: number | undefined;
}

interface ExploreFiltersProps {
	genres: { id: number; name: string }[];
	selectedGenres: Set<number>;
	onToggleGenre: (id: number) => void;
	yearRange: YearRange;
	onYearRangeChange: (range: YearRange) => void;
	onClearAll: () => void;
}

export function ExploreFilters({
	genres,
	selectedGenres,
	onToggleGenre,
	yearRange,
	onYearRangeChange,
	onClearAll,
}: ExploreFiltersProps) {
	const isMobile = useIsMobile();

	const activeFilterCount =
		(selectedGenres.size > 0 ? 1 : 0) +
		(yearRange.from !== undefined || yearRange.to !== undefined ? 1 : 0);

	if (isMobile) {
		return (
			<MobileFilters
				genres={genres}
				selectedGenres={selectedGenres}
				onToggleGenre={onToggleGenre}
				yearRange={yearRange}
				onYearRangeChange={onYearRangeChange}
				onClearAll={onClearAll}
				activeFilterCount={activeFilterCount}
			/>
		);
	}

	return (
		<div className="flex flex-wrap items-center gap-2">
			<GenreFilter
				genres={genres}
				selected={selectedGenres}
				onToggle={onToggleGenre}
			/>
			<YearFilter yearRange={yearRange} onYearRangeChange={onYearRangeChange} />
			{activeFilterCount > 0 && (
				<>
					<Separator orientation="vertical" className="mx-1 h-6" />
					<Button
						variant="ghost"
						size="sm"
						onClick={onClearAll}
						className="px-2 text-muted-foreground"
					>
						Reset
						<X className="ml-1 size-3.5" />
					</Button>
				</>
			)}
		</div>
	);
}

function GenreFilter({
	genres,
	selected,
	onToggle,
}: {
	genres: { id: number; name: string }[];
	selected: Set<number>;
	onToggle: (id: number) => void;
}) {
	const selectedGenres = genres.filter((g) => selected.has(g.id));

	return (
		<Popover>
			<PopoverTrigger asChild>
				<Button variant="outline" size="sm" className="border-dashed">
					<PlusCircle className="size-3.5" />
					Genre
					{selectedGenres.length > 0 && (
						<>
							<Separator orientation="vertical" className="mx-1 h-4" />
							<div className="flex gap-1">
								{selectedGenres.length > 2 ? (
									<Badge
										variant="secondary"
										className="rounded-sm px-1 font-normal"
									>
										{selectedGenres.length} selected
									</Badge>
								) : (
									selectedGenres.map((g) => (
										<Badge
											key={g.id}
											variant="secondary"
											className="rounded-sm px-1 font-normal"
										>
											{g.name}
										</Badge>
									))
								)}
							</div>
						</>
					)}
				</Button>
			</PopoverTrigger>
			<PopoverContent className="w-52 p-0" align="start">
				<Command>
					<CommandInput placeholder="Search genres..." />
					<CommandList>
						<CommandEmpty>No genre found.</CommandEmpty>
						<CommandGroup>
							{genres.map((genre) => {
								const isSelected = selected.has(genre.id);
								const Icon = genreIcons[genre.name] ?? Film;
								return (
									<CommandItem
										key={genre.id}
										onSelect={() => onToggle(genre.id)}
									>
										<div
											className={cn(
												"flex size-4 items-center justify-center rounded-sm border",
												isSelected
													? "border-primary bg-primary text-primary-foreground"
													: "border-muted-foreground/40 [&_svg]:invisible",
											)}
										>
											<Check className="size-3" />
										</div>
										<Icon className="size-3.5 shrink-0 text-muted-foreground" />
										<span>{genre.name}</span>
									</CommandItem>
								);
							})}
						</CommandGroup>
						{selected.size > 0 && (
							<>
								<CommandSeparator />
								<CommandGroup>
									<CommandItem
										onSelect={() => {
											for (const id of selected) {
												onToggle(id);
											}
										}}
										className="justify-center text-center"
									>
										Clear genres
									</CommandItem>
								</CommandGroup>
							</>
						)}
					</CommandList>
				</Command>
			</PopoverContent>
		</Popover>
	);
}

function YearFilter({
	yearRange,
	onYearRangeChange,
}: {
	yearRange: YearRange;
	onYearRangeChange: (range: YearRange) => void;
}) {
	const hasValue = yearRange.from !== undefined || yearRange.to !== undefined;

	const label = hasValue
		? `${yearRange.from ?? "..."} – ${yearRange.to ?? "..."}`
		: null;

	return (
		<Popover>
			<PopoverTrigger asChild>
				<Button variant="outline" size="sm" className="border-dashed">
					<PlusCircle className="size-3.5" />
					Year
					{label && (
						<>
							<Separator orientation="vertical" className="mx-1 h-4" />
							<Badge
								variant="secondary"
								className="rounded-sm px-1 font-normal"
							>
								{label}
							</Badge>
						</>
					)}
				</Button>
			</PopoverTrigger>
			<PopoverContent className="w-56 p-3" align="start">
				<div className="space-y-3">
					<p className="text-xs font-medium text-muted-foreground">
						Release year range
					</p>
					<div className="flex items-center gap-2">
						<Select
							value={yearRange.from?.toString() ?? ""}
							onValueChange={(v) =>
								onYearRangeChange({
									from: v ? Number(v) : undefined,
									to: yearRange.to,
								})
							}
						>
							<SelectTrigger className="h-8 w-full text-xs">
								<SelectValue placeholder="From" />
							</SelectTrigger>
							<SelectContent>
								{YEAR_OPTIONS.filter(
									(y) => yearRange.to === undefined || y <= yearRange.to,
								).map((y) => (
									<SelectItem key={y} value={y.toString()}>
										{y}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
						<span className="text-xs text-muted-foreground">–</span>
						<Select
							value={yearRange.to?.toString() ?? ""}
							onValueChange={(v) =>
								onYearRangeChange({
									from: yearRange.from,
									to: v ? Number(v) : undefined,
								})
							}
						>
							<SelectTrigger className="h-8 w-full text-xs">
								<SelectValue placeholder="To" />
							</SelectTrigger>
							<SelectContent>
								{YEAR_OPTIONS.filter(
									(y) => yearRange.from === undefined || y >= yearRange.from,
								).map((y) => (
									<SelectItem key={y} value={y.toString()}>
										{y}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>
					{hasValue && (
						<Button
							variant="ghost"
							size="sm"
							className="h-7 w-full text-xs"
							onClick={() =>
								onYearRangeChange({
									from: undefined,
									to: undefined,
								})
							}
						>
							Clear year
						</Button>
					)}
				</div>
			</PopoverContent>
		</Popover>
	);
}

function FilterTrigger({
	isExpanded,
	isActive,
	onClick,
	icon: Icon,
	children,
}: {
	isExpanded: boolean;
	isActive: boolean;
	onClick: () => void;
	icon: React.ComponentType<{ className?: string }>;
	children: React.ReactNode;
}) {
	return (
		<button
			type="button"
			onClick={onClick}
			className={cn(
				"flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-all active:scale-[0.97]",
				isExpanded
					? "border-primary/50 bg-primary/10 text-foreground"
					: isActive
						? "border-primary/40 bg-primary/[0.07] text-foreground"
						: "border-border bg-background text-muted-foreground",
			)}
		>
			<Icon className="size-3" />
			{children}
			<ChevronDown
				className={cn(
					"size-3 transition-transform duration-200",
					isExpanded && "rotate-180",
				)}
			/>
		</button>
	);
}

function ExpandablePanel({
	isOpen,
	children,
}: {
	isOpen: boolean;
	children: React.ReactNode;
}) {
	return (
		<div
			className={cn(
				"grid transition-all duration-200 ease-out",
				isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0",
			)}
		>
			<div className={cn(isOpen ? "overflow-visible" : "overflow-hidden")}>
				<div className="pb-1 pt-0.5">{children}</div>
			</div>
		</div>
	);
}

function MobileFilters({
	genres,
	selectedGenres,
	onToggleGenre,
	yearRange,
	onYearRangeChange,
	onClearAll,
	activeFilterCount,
}: ExploreFiltersProps & { activeFilterCount: number }) {
	const [expanded, setExpanded] = useState<"genre" | "year" | null>(null);
	const hasYear = yearRange.from !== undefined || yearRange.to !== undefined;

	function togglePanel(panel: "genre" | "year") {
		setExpanded(expanded === panel ? null : panel);
	}

	return (
		<div className="space-y-2">
			<div className="scrollbar-hide flex items-center gap-2 overflow-x-auto">
				<FilterTrigger
					isExpanded={expanded === "genre"}
					isActive={selectedGenres.size > 0}
					onClick={() => togglePanel("genre")}
					icon={Film}
				>
					Genre
					{selectedGenres.size > 0 && (
						<span className="flex size-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
							{selectedGenres.size}
						</span>
					)}
				</FilterTrigger>

				<FilterTrigger
					isExpanded={expanded === "year"}
					isActive={hasYear}
					onClick={() => togglePanel("year")}
					icon={Calendar}
				>
					{hasYear
						? `${yearRange.from ?? "..."} – ${yearRange.to ?? "..."}`
						: "Year"}
				</FilterTrigger>

				{selectedGenres.size > 0 && expanded !== "genre" && (
					<>
						<div className="mx-0.5 h-4 w-px shrink-0 bg-border" />
						{genres
							.filter((g) => selectedGenres.has(g.id))
							.map((g) => (
								<button
									key={g.id}
									type="button"
									onClick={() => onToggleGenre(g.id)}
									className="flex shrink-0 items-center gap-1 rounded-full bg-primary/10 px-2.5 py-1 text-[11px] font-medium text-foreground transition-all active:scale-95"
								>
									{g.name}
									<X className="size-2.5 text-muted-foreground" />
								</button>
							))}
					</>
				)}

				{activeFilterCount > 0 && (
					<button
						type="button"
						onClick={onClearAll}
						className="shrink-0 px-2 text-xs text-muted-foreground transition-colors active:text-foreground"
					>
						Reset
					</button>
				)}
			</div>

			<ExpandablePanel isOpen={expanded === "genre"}>
				<div className="flex flex-wrap gap-1.5">
					{genres.map((genre) => {
						const Icon = genreIcons[genre.name] ?? Film;
						const isSelected = selectedGenres.has(genre.id);
						return (
							<button
								key={genre.id}
								type="button"
								onClick={() => onToggleGenre(genre.id)}
								className={cn(
									"flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-all active:scale-[0.96]",
									isSelected
										? "border-primary/50 bg-primary/15 text-foreground"
										: "border-border/60 bg-card/40 text-muted-foreground",
								)}
							>
								<Icon className="size-3" />
								{genre.name}
								{isSelected && <Check className="size-3 text-primary" />}
							</button>
						);
					})}
				</div>
			</ExpandablePanel>

			<ExpandablePanel isOpen={expanded === "year"}>
				<div className="flex items-center gap-2">
					<Select
						value={yearRange.from?.toString() ?? ""}
						onValueChange={(v) =>
							onYearRangeChange({
								from: v ? Number(v) : undefined,
								to: yearRange.to,
							})
						}
					>
						<SelectTrigger className="h-9 w-full text-xs">
							<SelectValue placeholder="From year" />
						</SelectTrigger>
						<SelectContent>
							{YEAR_OPTIONS.filter(
								(y) => yearRange.to === undefined || y <= yearRange.to,
							).map((y) => (
								<SelectItem key={y} value={y.toString()}>
									{y}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
					<span className="shrink-0 text-xs text-muted-foreground">–</span>
					<Select
						value={yearRange.to?.toString() ?? ""}
						onValueChange={(v) =>
							onYearRangeChange({
								from: yearRange.from,
								to: v ? Number(v) : undefined,
							})
						}
					>
						<SelectTrigger className="h-9 w-full text-xs">
							<SelectValue placeholder="To year" />
						</SelectTrigger>
						<SelectContent>
							{YEAR_OPTIONS.filter(
								(y) => yearRange.from === undefined || y >= yearRange.from,
							).map((y) => (
								<SelectItem key={y} value={y.toString()}>
									{y}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
					{hasYear && (
						<button
							type="button"
							onClick={() =>
								onYearRangeChange({ from: undefined, to: undefined })
							}
							className="shrink-0 rounded-full p-1.5 text-muted-foreground transition-colors hover:bg-muted active:bg-muted"
						>
							<X className="size-3.5" />
						</button>
					)}
				</div>
			</ExpandablePanel>
		</div>
	);
}
