"use client";

import { useCallback, useMemo, useState } from "react";
import {
	parseAsArrayOf,
	parseAsInteger,
	parseAsString,
	useQueryState,
} from "nuqs";
import { SearchAutocomplete } from "@/components/search-autocomplete";
import { ExploreFilters } from "@/components/explore-filters";
import { ExploreResults } from "@/components/explore-results";

interface ExploreClientProps {
	genres: { id: number; name: string }[];
}

export function ExploreClient({ genres }: ExploreClientProps) {
	const [committedQuery, setCommittedQuery] = useQueryState(
		"q",
		parseAsString.withDefault(""),
	);
	const [inputValue, setInputValue] = useState(committedQuery);

	const [genreIds, setGenreIds] = useQueryState(
		"genres",
		parseAsArrayOf(parseAsInteger).withDefault([]),
	);
	const [yearFrom, setYearFrom] = useQueryState("from", parseAsInteger);
	const [yearTo, setYearTo] = useQueryState("to", parseAsInteger);

	const selectedGenres = useMemo(() => new Set(genreIds), [genreIds]);

	const handleToggleGenre = useCallback(
		(id: number) => {
			setGenreIds((prev) => {
				if (prev.includes(id)) {
					return prev.filter((g) => g !== id);
				}
				return [...prev, id];
			});
		},
		[setGenreIds],
	);

	const yearRange = useMemo(
		() => ({
			from: yearFrom ?? undefined,
			to: yearTo ?? undefined,
		}),
		[yearFrom, yearTo],
	);

	const handleYearRangeChange = useCallback(
		(range: { from: number | undefined; to: number | undefined }) => {
			setYearFrom(range.from ?? null);
			setYearTo(range.to ?? null);
		},
		[setYearFrom, setYearTo],
	);

	const handleClearFilters = useCallback(() => {
		setGenreIds(null);
		setYearFrom(null);
		setYearTo(null);
	}, [setGenreIds, setYearFrom, setYearTo]);

	const handleSearchSubmit = useCallback(
		(value: string) => {
			setCommittedQuery(value || null);
		},
		[setCommittedQuery],
	);

	const handleInputChange = useCallback(
		(value: string) => {
			setInputValue(value);
			// Clear results immediately when input is emptied
			if (value === "") {
				setCommittedQuery(null);
			}
		},
		[setCommittedQuery],
	);

	const filters = useMemo(
		() => ({
			genres: genreIds,
			yearGte: yearFrom ?? undefined,
			yearLte: yearTo ?? undefined,
		}),
		[genreIds, yearFrom, yearTo],
	);

	return (
		<>
			<SearchAutocomplete
				value={inputValue}
				onChange={handleInputChange}
				onSubmit={handleSearchSubmit}
			/>

			<ExploreFilters
				genres={genres}
				selectedGenres={selectedGenres}
				onToggleGenre={handleToggleGenre}
				yearRange={yearRange}
				onYearRangeChange={handleYearRangeChange}
				onClearAll={handleClearFilters}
			/>

			<ExploreResults
				query={committedQuery}
				filters={filters}
				genreList={genres}
			/>
		</>
	);
}
