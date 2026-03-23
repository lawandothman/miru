import {
	mergeWatchProviders,
	normalizeWatchProvider,
	normalizeWatchProviderIds,
} from "@miru/db";
import { describe, expect, it } from "vitest";

describe("watch provider canonicalization", () => {
	it("dedupes alias provider ids to their canonical ids", () => {
		expect(normalizeWatchProviderIds([10, 9, 2100, 2300, 41])).toEqual([9, 41]);
	});

	it("normalizes aliased provider metadata to the canonical provider", () => {
		expect(
			normalizeWatchProvider({
				displayPriority: 114,
				id: 2300,
				logoPath: "/1LuvKw01c2KQCt6DqgAgR06H2pT.jpg",
				name: "ITVX Premium",
			}),
		).toEqual({
			displayPriority: 20,
			id: 41,
			logoPath: "/1LuvKw01c2KQCt6DqgAgR06H2pT.jpg",
			name: "ITVX",
		});
	});

	it("merges aliased providers into a single canonical provider row", () => {
		expect(
			mergeWatchProviders([
				{
					displayPriority: 206,
					id: 2100,
					logoPath: "/8aBqoNeGGr0oSA85iopgNZUOTOc.jpg",
					name: "Amazon Prime Video with Ads",
				},
				{
					displayPriority: 5,
					id: 9,
					logoPath: "/pvske1MyAoymrs5bguRfVqYiM9a.jpg",
					name: "Amazon Prime Video",
				},
			]),
		).toEqual([
			{
				displayPriority: 5,
				id: 9,
				logoPath: "/pvske1MyAoymrs5bguRfVqYiM9a.jpg",
				name: "Amazon Prime Video",
			},
		]);
	});
});
