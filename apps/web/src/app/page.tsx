import Link from "next/link";
import Image from "next/image";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { Bookmark } from "lucide-react";
import { RevealOnScroll } from "@/components/reveal-on-scroll";

/* ── Verified poster paths from the database ── */
const posters = {
	darkKnight: "/qJ2tW6WMUDux911r6m7haRef0WH.jpg",
	dune: "/d5NXSklXo0qyIYkgV94XAgMIckC.jpg",
	fightClub: "/pB8BM7pdSp6B6Ih7QZ4DrQ3PmJK.jpg",
	grandBudapest: "/eWdyYQreja6JGCzqHWXpWHDrrPo.jpg",
	inception: "/xlaY2zyzMfkhk0HSC5VUwzoZPU1.jpg",
	interstellar: "/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg",
	ladybird: "/gl66K7zRdtNYGrxyS2YDUP5ASZd.jpg",
	parasite: "/7IiTTgloJzvGI1TAYymCfbfl3vT.jpg",
	whiplash: "/7fn624j5lj3xTme2SgiLCeuedmO.jpg",
};

function tmdb(path: string, size = "w342") {
	return `https://image.tmdb.org/t/p/${size}${path}`;
}

export default async function Home() {
	const session = await auth.api.getSession({
		headers: await headers(),
	});

	if (session) {
		redirect("/dashboard");
	}

	return (
		<div className="relative min-h-svh bg-background text-foreground">
			{/* ── Nav ── */}
			<nav className="flex items-center justify-between px-6 py-6 lg:px-16">
				<span className="font-display text-lg font-bold tracking-tight">
					Miru
				</span>
				<Link
					href="/signin"
					className="text-[13px] text-foreground/40 transition-colors hover:text-foreground"
				>
					Sign in
				</Link>
			</nav>

			{/* ── Hero ── */}
			<section className="relative px-6 pb-32 pt-16 lg:px-16 lg:pt-24">
				{/* Ambient glow */}
				<div className="pointer-events-none absolute left-1/2 top-0 -translate-x-1/2">
					<div className="h-[600px] w-[800px] rounded-full bg-foreground/[0.015] blur-[120px]" />
				</div>

				<div className="relative mx-auto grid max-w-6xl items-center gap-16 lg:grid-cols-2 lg:gap-20">
					{/* Text */}
					<div className="animate-fade-in-up max-w-lg">
						<h1 className="font-display text-[clamp(2.8rem,6vw,4.5rem)] font-bold leading-[1.05] tracking-tight">
							The social way
							<br />
							to pick your
							<br />
							next movie
						</h1>
						<p
							className="animate-fade-in-up mt-6 max-w-sm text-[15px] leading-relaxed text-foreground/40"
							style={{ animationDelay: "0.1s" }}
						>
							Build your watchlist, follow friends, and instantly see which
							movies you both want to watch. No more group chat debates.
						</p>
						<div
							className="animate-fade-in-up mt-10 flex items-center gap-4"
							style={{ animationDelay: "0.15s" }}
						>
							<Link
								href="/signin"
								className="inline-flex h-12 items-center rounded-full bg-foreground px-8 text-[13px] font-semibold text-background transition-opacity hover:opacity-90"
							>
								Join for free
							</Link>
							<Link
								href="/explore"
								className="inline-flex h-12 items-center rounded-full border border-foreground/10 px-8 text-[13px] font-medium text-foreground/60 transition-colors hover:border-foreground/20 hover:text-foreground/80"
							>
								Explore
							</Link>
						</div>
						<p
							className="animate-fade-in-up mt-5 text-[13px] text-foreground/25"
							style={{ animationDelay: "0.2s" }}
						>
							Already a member?{" "}
							<Link
								href="/signin"
								className="underline underline-offset-2 transition-colors hover:text-foreground/40"
							>
								Sign in.
							</Link>
						</p>
					</div>

					{/* Hero visual — floating movie posters */}
					<div
						className="animate-fade-in relative hidden h-[500px] lg:block"
						style={{ animationDelay: "0.3s" }}
					>
						{/* Back poster */}
						<div
							className="absolute right-20 top-4 w-[155px] overflow-hidden rounded-xl shadow-2xl shadow-black/25 dark:shadow-black/50"
							style={{ transform: "rotate(6deg)" }}
						>
							<Image
								src={tmdb(posters.interstellar)}
								alt=""
								width={155}
								height={233}
								className="aspect-[2/3] object-cover"
							/>
						</div>

						{/* Middle poster */}
						<div
							className="absolute right-40 top-16 w-[165px] overflow-hidden rounded-xl shadow-2xl shadow-black/25 dark:shadow-black/50"
							style={{ transform: "rotate(-4deg)" }}
						>
							<Image
								src={tmdb(posters.parasite)}
								alt=""
								width={165}
								height={248}
								className="aspect-[2/3] object-cover"
							/>
						</div>

						{/* Front poster */}
						<div
							className="absolute right-6 top-28 w-[175px] overflow-hidden rounded-xl shadow-2xl shadow-black/25 dark:shadow-black/50"
							style={{ transform: "rotate(2deg)" }}
						>
							<Image
								src={tmdb(posters.inception)}
								alt=""
								width={175}
								height={263}
								className="aspect-[2/3] object-cover"
								priority
							/>
						</div>

						{/* Match pill */}
						<div
							className="absolute bottom-20 left-0 flex items-center gap-2.5 rounded-full border border-foreground/10 bg-muted dark:bg-[#111] px-4 py-2.5 shadow-xl"
							style={{ transform: "rotate(-2deg)" }}
						>
							<div className="flex -space-x-2">
								<div className="flex size-6 items-center justify-center rounded-full bg-amber-500/20 text-[9px] font-bold text-amber-300 ring-2 ring-muted dark:ring-[#111]">
									S
								</div>
								<div className="flex size-6 items-center justify-center rounded-full bg-sky-500/20 text-[9px] font-bold text-sky-300 ring-2 ring-muted dark:ring-[#111]">
									J
								</div>
							</div>
							<span className="text-xs text-foreground/50">3 matches</span>
						</div>

						{/* Watchlist badge */}
						<div
							className="absolute bottom-36 right-0 flex items-center gap-1.5 rounded-full border border-foreground/10 bg-muted dark:bg-[#111] px-3.5 py-2 shadow-xl"
							style={{ transform: "rotate(3deg)" }}
						>
							<Bookmark className="size-3 text-foreground/50" />
							<span className="text-xs text-foreground/50">Watchlist</span>
						</div>
					</div>
				</div>
			</section>

			{/* ── Decorative separator ── */}
			<SectionDivider />

			{/* ── Features — Zigzag ── */}
			<section className="px-6 py-20 lg:px-16">
				<div className="mx-auto max-w-6xl space-y-40">
					{/* Feature 1: Watchlist */}
					<div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-20">
						<RevealOnScroll direction="left">
							<MockWatchlist />
						</RevealOnScroll>
						<RevealOnScroll direction="right" delay={150}>
							<div>
								<p className="mb-3 flex items-center gap-2 font-display text-xs font-medium uppercase tracking-[0.2em] text-foreground/20 sm:gap-3">
									<span className="hidden h-px w-6 bg-foreground/10 sm:inline-block" />
									Organize
								</p>
								<h2 className="font-display text-3xl font-semibold tracking-tight sm:text-[2.5rem] sm:leading-[1.1]">
									Build your
									<br />
									watchlist
								</h2>
								<p className="mt-4 max-w-sm text-[15px] leading-relaxed text-foreground/40">
									Search for any movie and save it to your list. Browse by
									genre, check what&apos;s trending, or explore personalized
									picks.
								</p>
							</div>
						</RevealOnScroll>
					</div>

					{/* Connector */}
					<ConnectorSvg />

					{/* Feature 2: Matches */}
					<div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-20">
						<RevealOnScroll direction="left" className="lg:order-2">
							<MockMatches />
						</RevealOnScroll>
						<RevealOnScroll
							direction="right"
							delay={150}
							className="lg:order-1"
						>
							<div>
								<p className="mb-3 flex items-center gap-2 font-display text-xs font-medium uppercase tracking-[0.2em] text-foreground/20 sm:gap-3">
									<span className="hidden h-px w-6 bg-foreground/10 sm:inline-block" />
									Connect
								</p>
								<h2 className="font-display text-3xl font-semibold tracking-tight sm:text-[2.5rem] sm:leading-[1.1]">
									See your
									<br />
									matches
								</h2>
								<p className="mt-4 max-w-sm text-[15px] leading-relaxed text-foreground/40">
									Follow your friends and Miru instantly shows you which movies
									you both want to watch. The perfect pick, without the debate.
								</p>
							</div>
						</RevealOnScroll>
					</div>

					{/* Connector */}
					<ConnectorSvg flip />

					{/* Feature 3: Discover */}
					<div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-20">
						<RevealOnScroll direction="left">
							<MockForYou />
						</RevealOnScroll>
						<RevealOnScroll direction="right" delay={150}>
							<div>
								<p className="mb-3 flex items-center gap-2 font-display text-xs font-medium uppercase tracking-[0.2em] text-foreground/20 sm:gap-3">
									<span className="hidden h-px w-6 bg-foreground/10 sm:inline-block" />
									Discover
								</p>
								<h2 className="font-display text-3xl font-semibold tracking-tight sm:text-[2.5rem] sm:leading-[1.1]">
									Discover
									<br />
									together
								</h2>
								<p className="mt-4 max-w-sm text-[15px] leading-relaxed text-foreground/40">
									Get recommendations based on what your circle is watching. The
									more friends you follow, the better your suggestions get.
								</p>
							</div>
						</RevealOnScroll>
					</div>
				</div>
			</section>

			{/* ── Decorative separator ── */}
			<SectionDivider />

			{/* ── Final CTA ── */}
			<section className="relative mt-20 px-6 pb-20 pt-36 lg:px-16">
				{/* Ambient glow */}
				<div className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
					<div className="h-[400px] w-[600px] rounded-full bg-foreground/[0.02] blur-[120px]" />
				</div>

				<RevealOnScroll>
					<div className="relative mx-auto flex max-w-lg flex-col items-center text-center">
						{/* Decorative film frames */}
						<div className="mb-8 flex items-center gap-1.5">
							{[...Array(5)].map((_, i) => (
								<div
									key={i}
									className="size-2 rounded-[3px] border border-foreground/[0.08]"
									style={{ opacity: i === 2 ? 0.15 : 0.06 }}
								/>
							))}
						</div>

						<h2 className="font-display text-3xl font-semibold tracking-tight sm:text-[2.5rem] sm:leading-[1.1]">
							Ready to join?
						</h2>
						<p className="mt-5 max-w-sm text-[15px] leading-relaxed text-foreground/35">
							Miru is free to use. Create an account, build your watchlist, and
							start finding movies to watch with friends.
						</p>
						<Link
							href="/signin"
							className="group mt-10 inline-flex h-12 items-center gap-2 rounded-full bg-foreground px-10 text-[13px] font-semibold text-background transition-all hover:shadow-[0_0_30px_rgba(0,0,0,0.06)] dark:hover:shadow-[0_0_30px_rgba(255,255,255,0.08)]"
						>
							Create a free account
							<svg
								className="size-3.5 transition-transform group-hover:translate-x-0.5"
								viewBox="0 0 16 16"
								fill="none"
							>
								<path
									d="M6 3l5 5-5 5"
									stroke="currentColor"
									strokeWidth="1.5"
									strokeLinecap="round"
									strokeLinejoin="round"
								/>
							</svg>
						</Link>
					</div>
				</RevealOnScroll>
			</section>

			{/* ── Footer ── */}
			<footer className="mt-20 border-t border-foreground/[0.06] px-6 py-10 lg:px-16">
				<div className="mx-auto max-w-6xl">
					<div className="flex flex-col items-center gap-5 sm:flex-row sm:justify-between">
						<span className="font-display text-sm font-bold text-foreground/20">
							Miru
						</span>
						<div className="flex gap-8 text-[13px] text-foreground/25">
							<Link
								href="/explore"
								className="transition-colors hover:text-foreground/50"
							>
								Explore
							</Link>
							<Link
								href="/about"
								className="transition-colors hover:text-foreground/50"
							>
								About
							</Link>
							<Link
								href="/terms-and-conditions"
								className="transition-colors hover:text-foreground/50"
							>
								Terms
							</Link>
							<Link
								href="/privacy"
								className="transition-colors hover:text-foreground/50"
							>
								Privacy
							</Link>
						</div>
					</div>
					<p className="mt-6 text-center text-[11px] text-foreground/25 sm:text-left">
						&copy; {new Date().getFullYear()} Miru. Find your next watch.
					</p>
				</div>
			</footer>
		</div>
	);
}

/* ─── Decorative Elements ─── */

function SectionDivider() {
	return (
		<div className="mx-auto max-w-6xl px-6 lg:px-16">
			<div className="relative h-px">
				<div className="absolute inset-0 bg-gradient-to-r from-transparent via-foreground/[0.06] to-transparent" />
				{/* Center diamond */}
				<div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
					<div className="size-1.5 rotate-45 bg-foreground/10" />
				</div>
			</div>
		</div>
	);
}

function ConnectorSvg({ flip }: { flip?: boolean }) {
	return (
		<div
			className={`-my-10 hidden items-center justify-center lg:flex ${flip ? "scale-x-[-1]" : ""}`}
		>
			<svg
				width="200"
				height="48"
				viewBox="0 0 200 48"
				fill="none"
				className="text-foreground/20"
			>
				<path
					d="M0 24C50 24 50 6 100 6C150 6 150 42 200 42"
					stroke="currentColor"
					strokeWidth="1"
					strokeDasharray="3 8"
					strokeLinecap="round"
				/>
				<circle cx="0" cy="24" r="2" fill="currentColor" />
				<circle cx="200" cy="42" r="2" fill="currentColor" />
			</svg>
		</div>
	);
}

/* ─── Mock UI Cards ─── */

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
			className={`relative overflow-hidden rounded-md bg-foreground/5 ${className ?? ""}`}
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
			className={`flex size-7 items-center justify-center rounded-full text-[10px] font-bold ring-2 ring-background ${color}`}
		>
			{name.charAt(0)}
		</div>
	);
}

function MockWatchlist() {
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

function MockMatches() {
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

function MockForYou() {
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
									className={`flex size-5 items-center justify-center rounded-full text-[8px] font-bold ring-1 ring-background ${m.friendColors[i]}`}
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
