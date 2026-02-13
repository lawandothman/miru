import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function NotFound() {
	return (
		<div className="relative flex min-h-svh flex-col items-center justify-center overflow-hidden px-6">
			{/* Background glow */}
			<div className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
				<div className="h-[500px] w-[500px] rounded-full bg-primary/[0.04] blur-[120px]" />
			</div>

			{/* Large decorative 404 */}
			<p className="select-none font-display text-[clamp(8rem,25vw,14rem)] font-bold leading-none tracking-tighter text-foreground/[0.04]">
				404
			</p>

			{/* Content overlaid on top */}
			<div className="-mt-16 text-center">
				<h1 className="font-display text-2xl font-semibold tracking-tight sm:text-3xl">
					Lost in the dark
				</h1>
				<p className="mx-auto mt-3 max-w-sm text-sm leading-relaxed text-muted-foreground">
					This scene doesn&apos;t exist. The page you&apos;re looking for may
					have been moved or deleted.
				</p>
				<Link
					href="/"
					className="mt-8 inline-flex h-10 items-center gap-2 rounded-lg bg-primary px-6 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
				>
					<ArrowLeft className="size-4" />
					Back to Miru
				</Link>
			</div>
		</div>
	);
}
