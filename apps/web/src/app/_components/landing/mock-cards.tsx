import Image from "next/image";
import { cn } from "@/lib/utils";
import { posters, tmdb } from "./posters";

function PosterThumb({
	path,
	alt,
	className,
}: {
	path: string;
	alt: string;
	className?: string;
}) {
	return (
		<div
			className={cn(
				"relative overflow-hidden rounded-md bg-foreground/5",
				className,
			)}
		>
			<Image
				src={tmdb(path, "w185")}
				alt={alt}
				fill
				className="object-cover"
				sizes="120px"
			/>
		</div>
	);
}

function UserPill({ name, color }: { name: string; color: string }) {
	return (
		<div
			className={cn(
				"flex size-7 items-center justify-center rounded-full text-[10px] font-bold ring-2 ring-background",
				color,
			)}
		>
			{name.charAt(0)}
		</div>
	);
}

export function MockWatchlist() {
	const movies = [
		{ path: posters.inception, title: "Inception" },
		{ path: posters.parasite, title: "Parasite" },
		{ path: posters.dune, title: "Dune" },
		{ path: posters.whiplash, title: "Whiplash" },
		{ path: posters.darkKnight, title: "The Dark Knight" },
		{ path: posters.grandBudapest, title: "Grand Budapest Hotel" },
	];

	return (
		<div className="rounded-2xl border border-foreground/[0.06] bg-foreground/[0.02] p-5">
			<div className="flex items-center justify-between px-1">
				<p className="text-sm font-medium text-foreground/70">My Watchlist</p>
				<p className="text-xs text-foreground/25">12 movies</p>
			</div>
			<div className="mt-4 grid grid-cols-3 gap-2">
				{movies.map((m) => (
					<div key={m.title} className="space-y-1.5">
						<PosterThumb path={m.path} alt={m.title} className="aspect-[2/3]" />
						<p className="truncate px-0.5 text-[10px] text-foreground/30">
							{m.title}
						</p>
					</div>
				))}
			</div>
		</div>
	);
}

export function MockMatches() {
	const matchedMovies = [
		{ path: posters.inception, title: "Inception" },
		{ path: posters.whiplash, title: "Whiplash" },
		{ path: posters.dune, title: "Dune" },
	];

	return (
		<div className="rounded-2xl border border-foreground/[0.06] bg-foreground/[0.02] p-5">
			<div className="flex items-center gap-3 px-1">
				<div className="flex -space-x-2">
					<UserPill name="Sarah" color="bg-amber-500/20 text-amber-300" />
					<UserPill name="You" color="bg-sky-500/20 text-sky-300" />
				</div>
				<div>
					<p className="text-sm font-medium text-foreground/70">
						3 matches with Sarah
					</p>
					<p className="text-[11px] text-foreground/25">
						Movies you both want to watch
					</p>
				</div>
			</div>
			<div className="mt-4 grid grid-cols-3 gap-2">
				{matchedMovies.map((m) => (
					<div key={m.title} className="space-y-1.5">
						<PosterThumb path={m.path} alt={m.title} className="aspect-[2/3]" />
						<p className="truncate px-0.5 text-[10px] text-foreground/30">
							{m.title}
						</p>
					</div>
				))}
			</div>
		</div>
	);
}

export function MockForYou() {
	const recommendations = [
		{
			friendColors: [
				"bg-rose-500/20 text-rose-300",
				"bg-emerald-500/20 text-emerald-300",
			],
			friends: ["A", "M"],
			path: posters.ladybird,
			title: "Lady Bird",
			year: "2017",
		},
		{
			friendColors: ["bg-violet-500/20 text-violet-300"],
			friends: ["J"],
			path: posters.fightClub,
			title: "Fight Club",
			year: "1999",
		},
		{
			friendColors: [
				"bg-rose-500/20 text-rose-300",
				"bg-amber-500/20 text-amber-300",
				"bg-violet-500/20 text-violet-300",
			],
			friends: ["A", "S", "J"],
			path: posters.grandBudapest,
			title: "The Grand Budapest Hotel",
			year: "2014",
		},
	];

	return (
		<div className="rounded-2xl border border-foreground/[0.06] bg-foreground/[0.02] p-5">
			<div className="px-1">
				<p className="text-sm font-medium text-foreground/70">For You</p>
				<p className="text-[11px] text-foreground/25">Based on 5 friends</p>
			</div>
			<div className="mt-4 space-y-3">
				{recommendations.map((m) => (
					<div
						key={m.title}
						className="flex items-center gap-3 rounded-xl bg-foreground/[0.02] p-2.5"
					>
						<PosterThumb
							path={m.path}
							alt={m.title}
							className="aspect-[2/3] w-12 shrink-0"
						/>
						<div className="min-w-0 flex-1">
							<p className="truncate text-[13px] font-medium text-foreground/70">
								{m.title}
							</p>
							<p className="text-[11px] text-foreground/25">{m.year}</p>
						</div>
						<div className="flex -space-x-1.5">
							{m.friends.map((f, i) => (
								<div
									key={f}
									className={cn(
										"flex size-5 items-center justify-center rounded-full text-[8px] font-bold ring-1 ring-background",
										m.friendColors[i],
									)}
								>
									{f}
								</div>
							))}
						</div>
					</div>
				))}
			</div>
		</div>
	);
}
