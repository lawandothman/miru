import { Skeleton } from "@/components/ui/skeleton";

export default function MovieLoading() {
	return (
		<div className="space-y-8">
			{/* Hero skeleton */}
			<div className="relative -mx-4 -mt-6 overflow-hidden lg:-mx-8 lg:-mt-8">
				<Skeleton className="h-[280px] w-full sm:h-[380px]" />
				<div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent" />

				<div className="absolute inset-x-0 bottom-0 px-4 pb-6 lg:px-8">
					<div className="flex gap-6">
						<Skeleton className="hidden h-[231px] w-[154px] shrink-0 rounded-lg sm:block" />
						<div className="flex flex-col justify-end gap-3">
							<Skeleton className="h-9 w-64" />
							<Skeleton className="h-4 w-40" />
							<div className="flex gap-3">
								<Skeleton className="h-4 w-12" />
								<Skeleton className="h-4 w-16" />
								<Skeleton className="h-4 w-8" />
							</div>
							<div className="mt-1 flex gap-2">
								<Skeleton className="h-9 w-28 rounded-lg" />
								<Skeleton className="h-9 w-28 rounded-lg" />
							</div>
						</div>
					</div>
				</div>
			</div>

			{/* Genres skeleton */}
			<div className="flex gap-2">
				{Array.from({ length: 4 }, (_, i) => (
					<Skeleton key={i} className="h-6 w-20 rounded-full" />
				))}
			</div>

			{/* Overview skeleton */}
			<div className="max-w-2xl space-y-2">
				<Skeleton className="h-4 w-full" />
				<Skeleton className="h-4 w-full" />
				<Skeleton className="h-4 w-3/4" />
			</div>
		</div>
	);
}
