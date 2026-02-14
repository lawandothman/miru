import type { Metadata } from "next";
import { MarketingShell } from "@/components/marketing-shell";

export const metadata: Metadata = {
	title: "About",
};

export default function AboutPage() {
	return (
		<MarketingShell>
			<main className="mx-auto max-w-2xl px-6 pb-24 pt-12 lg:px-8">
				<h1 className="font-display text-3xl font-bold tracking-tight">
					About Miru
				</h1>

				<div className="mt-8 space-y-6 leading-relaxed text-muted-foreground">
					<p>
						Miru is a platform that helps you and your friends find movies to
						watch together. One of the best parts of watching movies is sharing
						the experience with others, and Miru makes it easy to find the
						perfect film for your group.
					</p>
					<p>
						We compare your watchlists and identify common movies that you both
						want to see. This is especially helpful when you and your friends
						have different tastes &mdash; it lets you find a film you can all
						agree on.
					</p>
					<p>
						Add movies to your watchlist, follow your friends, and Miru will
						surface the matches. No more endless scrolling or group-chat
						debates.
					</p>

					<h2 className="font-display text-xl font-semibold text-foreground">
						Acknowledgements
					</h2>
					<p>
						This product uses the{" "}
						<a
							href="https://www.themoviedb.org/"
							target="_blank"
							rel="noopener noreferrer"
							className="text-foreground underline underline-offset-2 hover:text-foreground/70"
						>
							TMDB API
						</a>{" "}
						but is not endorsed or certified by TMDB. We use their API to
						provide movie information and recommendations.
					</p>
					<p>
						Streaming availability data is provided by{" "}
						<a
							href="https://www.justwatch.com/"
							target="_blank"
							rel="noopener noreferrer"
							className="text-foreground underline underline-offset-2 hover:text-foreground/70"
						>
							JustWatch
						</a>
						.
					</p>
				</div>
			</main>
		</MarketingShell>
	);
}
