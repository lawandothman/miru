import Link from "next/link";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { RevealOnScroll } from "@/components/reveal-on-scroll";
import { SectionDivider } from "./_components/landing/decorative";
import { AppStoreButton } from "./_components/landing/app-store-button";
import {
	MockWatchlist,
	MockMatches,
	MockForYou,
} from "./_components/landing/mock-cards";

export default async function Home() {
	const session = await auth.api.getSession({
		headers: await headers(),
	});

	if (session) {
		redirect("/dashboard");
	}

	return (
		<div className="relative min-h-svh overflow-x-clip bg-background text-foreground">
			{/* ── Nav ── */}
			<nav className="fixed inset-x-0 top-0 z-50 flex items-center justify-between bg-background/80 px-6 py-6 backdrop-blur-md lg:px-16">
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

			<div className="pt-[72px]">
				{/* ── Hero ── */}
				<section className="relative flex min-h-[calc(100svh-72px)] flex-col items-center justify-center px-6 pb-24 pt-12 lg:px-16">
					{/* Ambient glows */}
					<div className="pointer-events-none absolute inset-0 overflow-hidden">
						<div className="animate-glow-drift absolute left-1/3 top-[15%] h-[500px] w-[500px] rounded-full bg-primary/[0.07] blur-[150px]" />
						<div className="animate-glow-drift-reverse absolute bottom-[20%] right-1/4 h-[400px] w-[400px] rounded-full bg-primary/[0.05] blur-[120px]" />
					</div>

					{/* Text content */}
					<div className="animate-fade-in-up relative z-10 mx-auto max-w-3xl text-center">
						<h1 className="text-gradient-hero font-display text-[clamp(3rem,8vw,5.5rem)] font-bold leading-[0.95] tracking-tight">
							The social way
							<br />
							to pick your
							<br />
							next movie
						</h1>
						<p
							className="animate-fade-in-up mx-auto mt-6 max-w-md text-[15px] leading-relaxed text-foreground/40"
							style={{ animationDelay: "0.1s" }}
						>
							Build your watchlist, follow friends, and instantly see which
							movies you both want to watch. No more group chat debates.
						</p>
						<div
							className="animate-fade-in-up mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row"
							style={{ animationDelay: "0.15s" }}
						>
							<AppStoreButton className="shadow-[0_14px_30px_rgba(0,0,0,0.08)] dark:shadow-[0_14px_30px_rgba(0,0,0,0.28)]" />
							<Link
								href="/signin"
								className="inline-flex h-12 items-center rounded-full bg-foreground px-8 text-[13px] font-semibold text-background transition-opacity hover:opacity-90"
							>
								Join for free
							</Link>
						</div>
					</div>

					{/* Hero visual — cascading app preview */}
					<div
						className="animate-fade-in relative z-10 mt-16 w-full lg:mt-20"
						style={{ animationDelay: "0.3s" }}
					>
						<div className="pointer-events-none absolute inset-0 -z-10 mx-auto max-w-md rounded-full bg-primary/[0.08] blur-[100px]" />

						<div className="hidden lg:mx-auto lg:grid lg:max-w-5xl lg:grid-cols-3 lg:items-center lg:gap-5">
							<div className="lg:-rotate-2 lg:opacity-60">
								<MockWatchlist />
							</div>
							<div>
								<MockMatches />
							</div>
							<div className="lg:rotate-2 lg:opacity-60">
								<MockForYou />
							</div>
						</div>
					</div>
				</section>

				{/* ── Decorative separator ── */}
				<SectionDivider />

				{/* ── Features — Zigzag ── */}
				<section className="px-6 py-24 lg:px-16">
					<div className="mx-auto max-w-6xl space-y-32 lg:space-y-40">
						{/* Feature 1: Watchlist */}
						<div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-20">
							<RevealOnScroll direction="left">
								<MockWatchlist />
							</RevealOnScroll>
							<RevealOnScroll direction="right" delay={150}>
								<div>
									<p className="mb-3 flex items-center gap-2 font-display text-xs font-medium uppercase tracking-[0.2em] text-primary/60 sm:gap-3">
										<span className="hidden h-px w-6 bg-primary/30 sm:inline-block" />
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
									<p className="mb-3 flex items-center gap-2 font-display text-xs font-medium uppercase tracking-[0.2em] text-primary/60 sm:gap-3">
										<span className="hidden h-px w-6 bg-primary/30 sm:inline-block" />
										Connect
									</p>
									<h2 className="font-display text-3xl font-semibold tracking-tight sm:text-[2.5rem] sm:leading-[1.1]">
										See your
										<br />
										matches
									</h2>
									<p className="mt-4 max-w-sm text-[15px] leading-relaxed text-foreground/40">
										Follow your friends and Miru instantly shows you which
										movies you both want to watch. The perfect pick, without the
										debate.
									</p>
								</div>
							</RevealOnScroll>
						</div>

						{/* Feature 3: Discover */}
						<div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-20">
							<RevealOnScroll direction="left">
								<MockForYou />
							</RevealOnScroll>
							<RevealOnScroll direction="right" delay={150}>
								<div>
									<p className="mb-3 flex items-center gap-2 font-display text-xs font-medium uppercase tracking-[0.2em] text-primary/60 sm:gap-3">
										<span className="hidden h-px w-6 bg-primary/30 sm:inline-block" />
										Discover
									</p>
									<h2 className="font-display text-3xl font-semibold tracking-tight sm:text-[2.5rem] sm:leading-[1.1]">
										Discover
										<br />
										together
									</h2>
									<p className="mt-4 max-w-sm text-[15px] leading-relaxed text-foreground/40">
										Get recommendations based on what your circle is watching.
										The more friends you follow, the better your suggestions
										get.
									</p>
								</div>
							</RevealOnScroll>
						</div>
					</div>
				</section>

				{/* ── Decorative separator ── */}
				<SectionDivider />

				{/* ── Final CTA ── */}
				<section className="relative px-6 py-32 lg:px-16">
					{/* Ambient glow */}
					<div className="pointer-events-none absolute inset-0 overflow-hidden">
						<div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
							<div className="h-[400px] w-[600px] max-w-[100vw] rounded-full bg-primary/[0.06] blur-[150px]" />
						</div>
					</div>

					<RevealOnScroll>
						<div className="relative mx-auto flex max-w-lg flex-col items-center text-center">
							<h2 className="text-gradient-hero font-display text-4xl font-semibold tracking-tight sm:text-5xl sm:leading-[1.1]">
								Ready to join?
							</h2>
							<p className="mt-5 max-w-sm text-[15px] leading-relaxed text-foreground/35">
								Miru is free to use. Create an account, build your watchlist,
								and start finding movies to watch with friends.
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
				<footer className="border-t border-foreground/[0.06] px-6 py-10 lg:px-16">
					<div className="mx-auto max-w-6xl">
						<div className="flex flex-col items-center gap-5 sm:flex-row sm:justify-between">
							<span className="font-display text-sm font-bold text-foreground/20">
								Miru
							</span>
							<div className="flex gap-8 text-[13px] text-foreground/25">
								<Link
									href="/discover"
									className="transition-colors hover:text-foreground/50"
								>
									Discover
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
		</div>
	);
}
