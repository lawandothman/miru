import Link from "next/link";

export function MarketingShell({ children }: { children: React.ReactNode }) {
	return (
		<div className="relative min-h-svh bg-background text-foreground">
			<nav className="fixed inset-x-0 top-0 z-50 flex items-center justify-between bg-background px-6 py-6 lg:px-16">
				<Link
					href="/"
					className="font-display text-lg font-bold tracking-tight"
				>
					Miru
				</Link>
				<Link
					href="/signin"
					className="text-sm text-muted-foreground transition-colors hover:text-foreground"
				>
					Sign in
				</Link>
			</nav>

			<div className="pt-[72px]">{children}</div>

			<footer className="mt-20 border-t border-border/50 px-6 py-10 lg:px-16">
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
	);
}
