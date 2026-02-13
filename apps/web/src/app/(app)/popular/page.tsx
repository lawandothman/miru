import type { Metadata } from "next";
import { PopularMovies } from "@/components/popular-movies";

export const metadata: Metadata = {
	title: "Popular",
};

export default function PopularPage() {
	return (
		<div className="space-y-8">
			<div>
				<h1 className="font-display text-2xl font-semibold tracking-tight">
					Popular
				</h1>
				<p className="mt-1 text-sm text-muted-foreground">
					Most watched on Miru
				</p>
			</div>

			<PopularMovies />
		</div>
	);
}
