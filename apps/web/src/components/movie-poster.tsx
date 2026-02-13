import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface MoviePosterProps {
	id: number;
	title: string;
	posterPath: string | null;
	className?: string;
	priority?: boolean;
}

export function MoviePoster({
	id,
	title,
	posterPath,
	className,
	priority,
}: MoviePosterProps) {
	return (
		<Link
			href={`/movie/${id}`}
			className={cn(
				"group relative block overflow-hidden rounded-lg",
				className,
			)}
		>
			<div className="aspect-[2/3] bg-muted">
				{posterPath ? (
					<Image
						src={`https://image.tmdb.org/t/p/w500${posterPath}`}
						alt={title}
						fill
						className="object-cover transition-transform duration-300 group-hover:scale-105"
						sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
						priority={priority ?? false}
					/>
				) : (
					<div className="flex h-full items-center justify-center p-4 text-center text-xs text-muted-foreground">
						{title}
					</div>
				)}
			</div>
			<div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-3 pt-8 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
				<p className="text-sm font-medium text-white line-clamp-2">{title}</p>
			</div>
		</Link>
	);
}
