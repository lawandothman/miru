import Image from "next/image";
import { cn } from "@/lib/utils";
import { POSTER_BLUR_DATA_URL } from "@/lib/image-placeholder";
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
				placeholder="blur"
				blurDataURL={POSTER_BLUR_DATA_URL}
			/>
		</div>
	);
}

const avatars: Record<string, string> = {
	Sarah:
		"https://api.dicebear.com/9.x/lorelei/png?seed=Sarah&size=56&backgroundColor=ffd5dc",
	You: "https://api.dicebear.com/9.x/adventurer/png?seed=You&size=56&backgroundColor=b6e3f4",
	Alex: "https://api.dicebear.com/9.x/adventurer-neutral/png?seed=Alex&size=56&backgroundColor=ffdfbf",
	Maya: "https://api.dicebear.com/9.x/notionists/png?seed=Maya&size=56&backgroundColor=d1d4f9",
	Jordan:
		"https://api.dicebear.com/9.x/avataaars/png?seed=Jordan&size=56&backgroundColor=c0aede",
	Sam: "https://api.dicebear.com/9.x/lorelei/png?seed=Sam&size=56&backgroundColor=ffd5dc",
};

function UserAvatar({
	name,
	size = 28,
	ring = "ring-2 ring-background",
}: {
	name: string;
	size?: number;
	ring?: string;
}) {
	return (
		// oxlint-disable-next-line nextjs/no-img-element -- tiny decorative avatars, no optimization benefit
		<img
			src={
				avatars[name] ??
				`https://api.dicebear.com/9.x/adventurer/png?seed=${name}&size=56&backgroundColor=b6e3f4`
			}
			alt={name}
			width={size}
			height={size}
			className={cn("rounded-full object-cover", ring)}
			style={{ width: size, height: size }}
		/>
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
		<div className="rounded-2xl border border-foreground/[0.08] bg-foreground/[0.02] p-5 shadow-lg shadow-black/[0.04] dark:bg-white/[0.03] dark:shadow-[0_8px_32px_rgba(0,0,0,0.25)]">
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
		<div className="rounded-2xl border border-foreground/[0.08] bg-foreground/[0.02] p-5 shadow-lg shadow-black/[0.04] dark:bg-white/[0.03] dark:shadow-[0_8px_32px_rgba(0,0,0,0.25)]">
			<div className="flex items-center gap-3 px-1">
				<div className="flex -space-x-2">
					<UserAvatar name="Sarah" />
					<UserAvatar name="You" />
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
			friends: ["Alex", "Maya"],
			path: posters.ladybird,
			title: "Lady Bird",
			year: "2017",
		},
		{
			friends: ["Jordan"],
			path: posters.fightClub,
			title: "Fight Club",
			year: "1999",
		},
		{
			friends: ["Alex", "Sam", "Jordan"],
			path: posters.grandBudapest,
			title: "The Grand Budapest Hotel",
			year: "2014",
		},
	];

	return (
		<div className="rounded-2xl border border-foreground/[0.08] bg-foreground/[0.02] p-5 shadow-lg shadow-black/[0.04] dark:bg-white/[0.03] dark:shadow-[0_8px_32px_rgba(0,0,0,0.25)]">
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
							{m.friends.map((f) => (
								<UserAvatar
									key={f}
									name={f}
									size={20}
									ring="ring-1 ring-background"
								/>
							))}
						</div>
					</div>
				))}
			</div>
		</div>
	);
}
