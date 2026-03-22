import Image from "next/image";
import Link from "next/link";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { AppStoreButton } from "./_components/landing/app-store-button";

function PhoneFrame({
	src,
	alt,
	priority,
	className,
}: {
	src: string;
	alt: string;
	priority?: boolean;
	className?: string;
}) {
	return (
		<div className={className}>
			<div className="relative mx-auto w-[280px] sm:w-[320px]">
				<div className="absolute inset-x-4 -bottom-8 top-8 rounded-[3rem] bg-primary/5 blur-3xl" />
				<div className="relative rounded-[3rem] bg-gradient-to-b from-white/20 to-white/10 p-[3px] shadow-[0_20px_60px_rgba(0,0,0,0.4)]">
					<div className="overflow-hidden rounded-[calc(3rem-3px)] bg-black p-1.5 pt-2">
						<Image
							src={src}
							alt={alt}
							width={390}
							height={844}
							className="w-full rounded-[calc(3rem-8px)]"
							priority={priority ?? false}
						/>
					</div>
				</div>
			</div>
		</div>
	);
}

export default async function Home() {
	const session = await auth.api.getSession({
		headers: await headers(),
	});

	if (session) {
		redirect("/dashboard");
	}

	return (
		<div className="min-h-svh bg-background text-foreground">
			{/* ── Nav ── */}
			<nav className="fixed inset-x-0 top-0 z-50 flex items-center justify-between bg-background px-6 py-6 lg:px-16">
				<span className="font-display text-lg font-bold tracking-tight">
					Miru
				</span>
				<Link
					href="/signin"
					className="text-sm text-muted-foreground transition-colors hover:text-foreground"
				>
					Sign in
				</Link>
			</nav>

			<div className="pt-[72px]">
				{/* ── Hero ── */}
				<section className="px-6 pb-40 pt-20 lg:px-16 lg:pt-32">
					<div className="mx-auto max-w-6xl">
						<div className="flex flex-col items-center gap-16 lg:flex-row lg:items-start lg:justify-between lg:gap-12">
							<div className="max-w-xl shrink-0 text-center lg:pt-20 lg:text-left">
								<h1 className="font-display text-[clamp(2.5rem,7vw,4.5rem)] font-bold leading-[0.95] tracking-tight">
									Find movies
									<br />
									to watch
									<br />
									with friends
								</h1>
								<p className="mx-auto mt-6 max-w-md text-base leading-relaxed text-muted-foreground lg:mx-0">
									Build your watchlist, follow friends, and instantly see which
									movies you both want to watch.
								</p>
								<div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row lg:justify-start">
									<AppStoreButton />
									<Link
										href="/signin"
										className="inline-flex h-12 items-center rounded-lg bg-foreground px-8 text-sm font-semibold text-background transition-opacity hover:opacity-90"
									>
										Join for free
									</Link>
								</div>
							</div>

							<PhoneFrame
								src="/screenshots/home.png"
								alt="Miru home screen showing movie matches with friends"
								priority
							/>
						</div>
					</div>
				</section>

				{/* ── Feature 1: Discover ── */}
				<section className="px-6 py-24 lg:px-16 lg:py-32">
					<div className="mx-auto max-w-6xl">
						<div className="flex flex-col items-center gap-16 lg:flex-row lg:items-center lg:gap-24">
							<div className="lg:flex-1">
								<PhoneFrame
									src="/screenshots/discover.png"
									alt="Discover screen showing trending, new releases, and popular movies"
								/>
							</div>
							<div className="max-w-md text-center lg:flex-1 lg:text-left">
								<p className="font-display text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
									Discover
								</p>
								<h2 className="mt-3 font-display text-3xl font-semibold tracking-tight sm:text-[2.5rem] sm:leading-[1.1]">
									Browse what&apos;s
									<br />
									trending
								</h2>
								<p className="mt-5 text-base leading-relaxed text-muted-foreground">
									Explore trending movies, new releases, and what&apos;s popular
									on Miru. Search by title or browse by genre to find your next
									watch.
								</p>
							</div>
						</div>
					</div>
				</section>

				{/* ── Feature 2: Watchlist ── */}
				<section className="px-6 py-24 lg:px-16 lg:py-32">
					<div className="mx-auto max-w-6xl">
						<div className="flex flex-col items-center gap-16 lg:flex-row-reverse lg:items-center lg:gap-24">
							<div className="lg:flex-1">
								<PhoneFrame
									src="/screenshots/watchlist.png"
									alt="Watchlist screen showing saved movies in a grid"
								/>
							</div>
							<div className="max-w-md text-center lg:flex-1 lg:text-left">
								<p className="font-display text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
									Collect
								</p>
								<h2 className="mt-3 font-display text-3xl font-semibold tracking-tight sm:text-[2.5rem] sm:leading-[1.1]">
									Build your
									<br />
									watchlist
								</h2>
								<p className="mt-5 text-base leading-relaxed text-muted-foreground">
									Save movies you want to watch. Your watchlist is automatically
									matched against your friends&apos; lists so you never have to
									debate what to watch again.
								</p>
							</div>
						</div>
					</div>
				</section>

				{/* ── Feature 3: Connect ── */}
				<section className="px-6 py-24 lg:px-16 lg:py-32">
					<div className="mx-auto max-w-6xl">
						<div className="flex flex-col items-center gap-16 lg:flex-row lg:items-center lg:gap-24">
							<div className="lg:flex-1">
								<PhoneFrame
									src="/screenshots/profile.png"
									alt="Profile screen showing user stats, watchlist, and watched movies"
								/>
							</div>
							<div className="max-w-md text-center lg:flex-1 lg:text-left">
								<p className="font-display text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
									Connect
								</p>
								<h2 className="mt-3 font-display text-3xl font-semibold tracking-tight sm:text-[2.5rem] sm:leading-[1.1]">
									Follow
									<br />
									friends
								</h2>
								<p className="mt-5 text-base leading-relaxed text-muted-foreground">
									See what your friends are watching, track your movie history,
									and find your next movie night pick together.
								</p>
							</div>
						</div>
					</div>
				</section>

				{/* ── Final CTA ── */}
				<section className="px-6 py-32 lg:px-16 lg:py-40">
					<div className="mx-auto flex max-w-lg flex-col items-center text-center">
						<h2 className="font-display text-4xl font-semibold tracking-tight sm:text-5xl sm:leading-[1.1]">
							Ready to join?
						</h2>
						<p className="mt-5 max-w-sm text-base leading-relaxed text-muted-foreground">
							Miru is free. Create an account, build your watchlist, and start
							finding movies to watch with friends.
						</p>
						<div className="mt-10 flex flex-col items-center gap-4 sm:flex-row">
							<AppStoreButton />
							<Link
								href="/signin"
								className="group inline-flex h-12 items-center gap-2 rounded-lg bg-foreground px-10 text-sm font-semibold text-background transition-opacity hover:opacity-90"
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
					</div>
				</section>

				{/* ── Footer ── */}
				<footer className="border-t border-border/50 px-6 py-10 lg:px-16">
					<div className="mx-auto max-w-6xl">
						<div className="flex flex-col items-center gap-5 sm:flex-row sm:justify-between">
							<span className="font-display text-sm font-bold text-muted-foreground">
								Miru
							</span>
							<div className="flex gap-8 text-sm text-muted-foreground">
								<Link
									href="/discover"
									className="transition-colors hover:text-foreground"
								>
									Discover
								</Link>
								<Link
									href="/about"
									className="transition-colors hover:text-foreground"
								>
									About
								</Link>
								<Link
									href="/terms-and-conditions"
									className="transition-colors hover:text-foreground"
								>
									Terms
								</Link>
								<Link
									href="/privacy"
									className="transition-colors hover:text-foreground"
								>
									Privacy
								</Link>
							</div>
						</div>
						<p className="mt-6 text-center text-xs text-muted-foreground sm:text-left">
							&copy; {new Date().getFullYear()} Miru. Find your next watch.
						</p>
					</div>
				</footer>
			</div>
		</div>
	);
}
