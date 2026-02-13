import Link from "next/link";

export default function NotFound() {
	return (
		<div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
			<h1 className="font-display text-4xl font-bold tracking-tight">404</h1>
			<p className="mt-2 text-sm text-muted-foreground">
				This page doesn&apos;t exist.
			</p>
			<Link
				href="/"
				className="mt-6 inline-flex h-9 items-center rounded-lg bg-primary px-5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
			>
				Go home
			</Link>
		</div>
	);
}
