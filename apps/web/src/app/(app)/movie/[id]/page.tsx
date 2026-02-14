import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { trpc } from "@/lib/trpc/server";
import { ShareButton } from "@/components/share-button";
import { WatchedButton } from "@/components/watched-button";
import { WatchlistButton } from "@/components/watchlist-button";
import { UserAvatar } from "@/components/user-avatar";
import { Badge } from "@/components/ui/badge";

interface MoviePageProps {
	params: Promise<{ id: string }>;
}

export async function generateMetadata({
	params,
}: MoviePageProps): Promise<Metadata> {
	const { id } = await params;
	const api = await trpc();
	try {
		const movie = await api.movie.getById({ tmdbId: parseInt(id, 10) });
		const year = movie.releaseDate?.split("-")[0];
		const title = year ? `${movie.title} (${year})` : movie.title;
		return {
			description: movie.overview ?? undefined,
			openGraph: {
				description: movie.overview ?? undefined,
				title,
				type: "video.movie",
			},
			title,
		};
	} catch {
		return { title: "Movie" };
	}
}

export default async function MoviePage({ params }: MoviePageProps) {
	const { id } = await params;
	const tmdbId = parseInt(id, 10);
	if (isNaN(tmdbId)) {
		notFound();
	}

	const api = await trpc();

	let movie;
	try {
		movie = await api.movie.getById({ tmdbId });
	} catch {
		notFound();
	}

	const year = movie.releaseDate?.split("-")[0];
	const hours = movie.runtime ? Math.floor(movie.runtime / 60) : null;
	const minutes = movie.runtime ? movie.runtime % 60 : null;

	return (
		<div className="space-y-8">
			{/* Hero */}
			<div className="relative -mx-4 -mt-6 overflow-hidden lg:-mx-8 lg:-mt-8">
				{movie.backdropPath && (
					<Image
						src={`https://image.tmdb.org/t/p/original${movie.backdropPath}`}
						alt=""
						width={1920}
						height={1080}
						className="h-[280px] w-full object-cover object-top opacity-40 sm:h-[380px]"
						priority
					/>
				)}
				<div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent" />

				<div className="absolute inset-x-0 bottom-0 px-4 pb-6 lg:px-8">
					<div className="flex gap-6">
						{movie.posterPath && (
							<div className="hidden shrink-0 sm:block">
								<Image
									src={`https://image.tmdb.org/t/p/w500${movie.posterPath}`}
									alt={movie.title}
									width={154}
									height={231}
									className="rounded-lg shadow-2xl"
									priority
								/>
							</div>
						)}

						<div className="flex flex-col justify-end">
							<h1 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">
								{movie.title}
							</h1>
							{movie.tagline && (
								<p className="mt-1 text-sm italic text-muted-foreground">
									{movie.tagline}
								</p>
							)}
							<div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
								{year && <span>{year}</span>}
								{hours !== null && minutes !== null && (
									<>
										<span className="text-border">·</span>
										<span>
											{hours}h {minutes}m
										</span>
									</>
								)}
								{movie.tmdbVoteAverage !== null &&
									movie.tmdbVoteAverage !== undefined && (
										<>
											<span className="text-border">·</span>
											<span className="text-primary">
												{movie.tmdbVoteAverage.toFixed(1)}
											</span>
										</>
									)}
							</div>
							<div className="mt-4 flex gap-2">
								<WatchlistButton
									movieId={movie.id}
									inWatchlist={movie.inWatchlist}
								/>
								<WatchedButton movieId={movie.id} isWatched={movie.isWatched} />
								<ShareButton
									title={movie.title}
									text={`Check out ${movie.title} on Miru`}
								/>
							</div>
						</div>
					</div>
				</div>
			</div>

			{/* Genres */}
			{movie.genres && movie.genres.length > 0 && (
				<div className="flex flex-wrap gap-2">
					{movie.genres.map((mg) => (
						<Link key={mg.genre.id} href={`/genre/${mg.genre.id}`}>
							<Badge variant="secondary" className="hover:bg-accent">
								{mg.genre.name}
							</Badge>
						</Link>
					))}
				</div>
			)}

			{/* Overview */}
			{movie.overview && (
				<p className="max-w-2xl leading-relaxed text-muted-foreground">
					{movie.overview}
				</p>
			)}

			{/* Watch with friends */}
			{movie.matches.length > 0 && (
				<div className="space-y-3">
					<h2 className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
						Watch with
					</h2>
					<div className="flex flex-wrap gap-2">
						{movie.matches.map((friend) => (
							<Link
								key={friend.id}
								href={`/user/${friend.id}`}
								className="flex items-center gap-2 rounded-full border border-border/50 bg-card py-1.5 pl-1.5 pr-4 transition-colors hover:border-primary/30"
							>
								<UserAvatar
									name={friend.name ?? "?"}
									image={friend.image}
									size="sm"
								/>
								<span className="text-sm font-medium">{friend.name}</span>
							</Link>
						))}
					</div>
				</div>
			)}

			{/* Streaming */}
			{movie.streamProviders && movie.streamProviders.length > 0 && (
				<div className="space-y-3">
					<h2 className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
						Stream
					</h2>
					<div className="flex flex-wrap gap-3">
						{movie.streamProviders.map((sp) => (
							<div
								key={sp.provider.id}
								className="flex items-center gap-2 rounded-lg border border-border/50 bg-card px-3 py-2"
							>
								{sp.provider.logoPath && (
									<Image
										src={`https://image.tmdb.org/t/p/w92${sp.provider.logoPath}`}
										alt={sp.provider.name}
										width={24}
										height={24}
										className="rounded"
									/>
								)}
								<span className="text-sm">{sp.provider.name}</span>
							</div>
						))}
					</div>
				</div>
			)}

			{/* Trailer */}
			{movie.trailerKey && movie.trailerSite === "YouTube" && (
				<div className="space-y-3">
					<h2 className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
						Trailer
					</h2>
					<div className="aspect-video overflow-hidden rounded-xl">
						<iframe
							src={`https://www.youtube.com/embed/${movie.trailerKey}`}
							title={`${movie.title} trailer`}
							allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
							allowFullScreen
							sandbox="allow-scripts allow-same-origin allow-presentation"
							loading="lazy"
							className="h-full w-full"
						/>
					</div>
				</div>
			)}

			{/* Links */}
			<div className="flex gap-4 text-sm">
				{movie.homepage && (
					<a
						href={movie.homepage}
						target="_blank"
						rel="noopener noreferrer"
						className="text-muted-foreground underline underline-offset-2 hover:text-foreground"
					>
						Official Site
					</a>
				)}
				{movie.imdbId && (
					<a
						href={`https://www.imdb.com/title/${movie.imdbId}`}
						target="_blank"
						rel="noopener noreferrer"
						className="text-muted-foreground underline underline-offset-2 hover:text-foreground"
					>
						IMDb
					</a>
				)}
			</div>
		</div>
	);
}
