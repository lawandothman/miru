"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Film, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useDebounce } from "@/hooks/use-debounce";
import { trpc } from "@/lib/trpc/client";
import { movieSlug } from "@/lib/movie-slug";
import { cn } from "@/lib/utils";

interface SearchAutocompleteProps {
	value: string;
	onChange: (value: string) => void;
	onSubmit: (value: string) => void;
}

export function SearchAutocomplete({
	value,
	onChange,
	onSubmit,
}: SearchAutocompleteProps) {
	const router = useRouter();
	const [showDropdown, setShowDropdown] = useState(false);
	const [activeIndex, setActiveIndex] = useState(-1);
	const inputRef = useRef<HTMLInputElement>(null);

	const debouncedValue = useDebounce(value, 300);

	const { data: suggestions } = trpc.movie.searchAutocomplete.useQuery(
		{ query: debouncedValue },
		{ enabled: debouncedValue.length >= 2 },
	);

	const items = suggestions ?? [];

	function selectMovie(movie: { id: number; title: string }) {
		setShowDropdown(false);
		setActiveIndex(-1);
		router.push(`/movie/${movieSlug(movie.title, movie.id)}`);
	}

	function commitSearch() {
		setShowDropdown(false);
		setActiveIndex(-1);
		onSubmit(value);
		inputRef.current?.blur();
	}

	function handleKeyDown(e: React.KeyboardEvent) {
		if (e.key === "Enter") {
			e.preventDefault();
			if (activeIndex >= 0) {
				const item = items[activeIndex];
				if (item) {
					selectMovie(item);
				}
			} else {
				commitSearch();
			}
			return;
		}

		if (e.key === "Escape") {
			setShowDropdown(false);
			setActiveIndex(-1);
			return;
		}

		if (!showDropdown || items.length === 0) {
			return;
		}

		if (e.key === "ArrowDown") {
			e.preventDefault();
			setActiveIndex((prev) => (prev < items.length - 1 ? prev + 1 : 0));
		} else if (e.key === "ArrowUp") {
			e.preventDefault();
			setActiveIndex((prev) => (prev > 0 ? prev - 1 : items.length - 1));
		}
	}

	return (
		<div className="relative">
			<Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
			<Input
				ref={inputRef}
				placeholder="Search movies or people..."
				value={value}
				onChange={(e) => {
					onChange(e.target.value);
					setShowDropdown(true);
					setActiveIndex(-1);
				}}
				onFocus={() => setShowDropdown(true)}
				onBlur={() => {
					setTimeout(() => setShowDropdown(false), 200);
				}}
				onKeyDown={handleKeyDown}
				className="h-11 rounded-xl pl-10"
			/>
			{showDropdown && items.length > 0 && value.length >= 2 && (
				<div className="absolute inset-x-0 top-full z-50 mt-1 animate-in fade-in-0 slide-in-from-top-1 overflow-hidden rounded-xl border border-border/50 bg-popover shadow-lg duration-150">
					{items.map((movie, i) => (
						<button
							key={movie.id}
							type="button"
							onMouseDown={(e) => e.preventDefault()}
							onClick={() => selectMovie(movie)}
							className={cn(
								"flex w-full items-center gap-3 px-3 py-2 text-left transition-colors",
								i === activeIndex ? "bg-primary/10" : "hover:bg-muted",
							)}
						>
							{movie.posterPath ? (
								<Image
									src={`https://image.tmdb.org/t/p/w92${movie.posterPath}`}
									alt={movie.title}
									width={32}
									height={48}
									className="rounded-md object-cover"
								/>
							) : (
								<div className="flex h-12 w-8 shrink-0 items-center justify-center rounded-md bg-muted">
									<Film className="size-3.5 text-muted-foreground" />
								</div>
							)}
							<div className="min-w-0 flex-1">
								<p className="truncate text-sm font-medium">{movie.title}</p>
								{movie.releaseDate && (
									<p className="text-xs text-muted-foreground">
										{movie.releaseDate.slice(0, 4)}
									</p>
								)}
							</div>
						</button>
					))}
				</div>
			)}
		</div>
	);
}
