"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MovieGrid } from "@/components/movie-grid";

interface Movie {
	id: number;
	posterPath: string | null;
	title: string;
}

interface ProfileTabsProps {
	watchlist: Movie[];
	watched: Movie[];
	watchlistLabel: string;
	watchedLabel: string;
}

export function ProfileTabs({
	watchlist,
	watched,
	watchlistLabel,
	watchedLabel,
}: ProfileTabsProps) {
	return (
		<Tabs defaultValue="watchlist" className="gap-5">
			<TabsList className="h-auto w-fit rounded-none border-b border-border bg-transparent p-0">
				<TabsTrigger
					value="watchlist"
					className="gap-2.5 rounded-none border-b-2 border-transparent bg-transparent px-4 py-2 text-sm font-medium text-muted-foreground shadow-none transition-colors data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-foreground data-[state=active]:shadow-none"
				>
					{watchlistLabel}
					<span className="rounded-full border border-border bg-foreground/5 px-1.5 py-0.5 text-[11px] tabular-nums leading-none text-muted-foreground">
						{watchlist.length}
					</span>
				</TabsTrigger>
				<TabsTrigger
					value="watched"
					className="gap-2.5 rounded-none border-b-2 border-transparent bg-transparent px-4 py-2 text-sm font-medium text-muted-foreground shadow-none transition-colors data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-foreground data-[state=active]:shadow-none"
				>
					{watchedLabel}
					<span className="rounded-full border border-border bg-foreground/5 px-1.5 py-0.5 text-[11px] tabular-nums leading-none text-muted-foreground">
						{watched.length}
					</span>
				</TabsTrigger>
			</TabsList>
			<TabsContent value="watchlist">
				<MovieGrid
					movies={watchlist}
					emptyMessage="No movies in watchlist"
				/>
			</TabsContent>
			<TabsContent value="watched">
				<MovieGrid
					movies={watched}
					emptyMessage="No watched movies"
				/>
			</TabsContent>
		</Tabs>
	);
}
