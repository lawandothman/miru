import type { RouterInputs } from "@miru/trpc";

export type MovieRating = NonNullable<
	RouterInputs["watched"]["rate"]["rating"]
>;

export interface MovieSummary {
	id: number;
	title: string;
	posterPath: string | null;
	rating?: MovieRating | null;
}
