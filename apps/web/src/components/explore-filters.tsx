"use client";

import { Check, Film, PlusCircle, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { genreIcons, GenrePicker } from "@/components/genre-picker";
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
import {
	Drawer,
	DrawerClose,
	DrawerContent,
	DrawerDescription,
	DrawerFooter,
	DrawerHeader,
	DrawerTitle,
	DrawerTrigger,
} from "@/components/ui/drawer";
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

function MobileFilters({
	genres,
	selectedGenres,
	onToggleGenre,
	yearRange,
	onYearRangeChange,
	onClearAll,
	activeFilterCount,
}: ExploreFiltersProps & { activeFilterCount: number }) {
	return (
		<Drawer>
			<div className="flex items-center gap-2">
				<DrawerTrigger asChild>
					<Button variant="outline" size="sm" className="gap-1.5">
						<PlusCircle className="size-3.5" />
						Filters
						{activeFilterCount > 0 && (
							<Badge variant="default" className="ml-0.5 size-5 p-0">
								{activeFilterCount}
							</Badge>
						)}
					</Button>
				</DrawerTrigger>
				{activeFilterCount > 0 && (
					<Button
						variant="ghost"
						size="sm"
						onClick={onClearAll}
						className="text-muted-foreground"
					>
						Reset
						<X className="ml-1 size-3.5" />
					</Button>
				)}
			</div>
			<DrawerContent>
				<DrawerHeader>
					<DrawerTitle>Filters</DrawerTitle>
					<DrawerDescription className="sr-only">
						Filter movies by genre and year
					</DrawerDescription>
				</DrawerHeader>
				<div className="space-y-5 overflow-y-auto px-4 pb-2">
					<div className="space-y-2">
						<h3 className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
							Genres
						</h3>
						<GenrePicker
							genres={genres}
							selected={selectedGenres}
							onToggle={onToggleGenre}
							compact
						/>
					</div>
					<div className="space-y-2">
						<h3 className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
							Year Range
						</h3>
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
								<SelectTrigger className="w-full">
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
							<span className="text-sm text-muted-foreground">–</span>
							<Select
								value={yearRange.to?.toString() ?? ""}
								onValueChange={(v) =>
									onYearRangeChange({
										from: yearRange.from,
										to: v ? Number(v) : undefined,
									})
								}
							>
								<SelectTrigger className="w-full">
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
					</div>
				</div>
				<DrawerFooter>
					<DrawerClose asChild>
						<Button>Done</Button>
					</DrawerClose>
				</DrawerFooter>
			</DrawerContent>
		</Drawer>
	);
}
