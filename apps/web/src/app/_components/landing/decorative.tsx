import { cn } from "@/lib/utils";

export function SectionDivider() {
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

export function ConnectorSvg({ flip }: { flip?: boolean }) {
	return (
		<div
			className={cn(
				"-my-10 hidden items-center justify-center lg:flex",
				flip && "scale-x-[-1]",
			)}
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
