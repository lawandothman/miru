import { ImageResponse } from "next/og";
import { trpc } from "@/lib/trpc/server";
import { movieIdFromSlug } from "@/lib/movie-slug";

export const alt = "Movie on Miru";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function MovieOGImage({
	params,
}: {
	params: Promise<{ slug: string }>;
}) {
	const { slug } = await params;
	const tmdbId = movieIdFromSlug(slug);

	let movie: {
		overview: string | null;
		posterPath: string | null;
		releaseDate: string | null;
		runtime: number | null;
		title: string;
	} | null = null;

	try {
		const api = await trpc();
		movie = await api.movie.getById({ tmdbId });
	} catch {
		// fall through to fallback
	}

	if (!movie) {
		return new ImageResponse(
			<div
				style={{
					alignItems: "center",
					background: "#060606",
					color: "#fff",
					display: "flex",
					fontSize: 48,
					fontWeight: 800,
					height: "100%",
					justifyContent: "center",
					width: "100%",
				}}
			>
				Miru
			</div>,
			{ ...size },
		);
	}

	const year = movie.releaseDate?.split("-")[0];
	const posterUrl = movie.posterPath
		? `https://image.tmdb.org/t/p/w500${movie.posterPath}`
		: null;

	return new ImageResponse(
		<div
			style={{
				background: "#060606",
				display: "flex",
				height: "100%",
				padding: 60,
				width: "100%",
			}}
		>
			{/* Poster */}
			{posterUrl && (
				// oxlint-disable-next-line nextjs/no-img-element -- OG images use Satori which requires <img>
				<img
					src={posterUrl}
					alt=""
					width={340}
					height={510}
					style={{
						borderRadius: 16,
						objectFit: "cover",
					}}
				/>
			)}

			{/* Info */}
			<div
				style={{
					display: "flex",
					flex: 1,
					flexDirection: "column",
					justifyContent: "center",
					paddingLeft: posterUrl ? 56 : 0,
				}}
			>
				<span
					style={{
						color: "#fff",
						display: "flex",
						fontSize: 52,
						fontWeight: 800,
						letterSpacing: "-0.02em",
						lineHeight: 1.1,
						maxWidth: 650,
					}}
				>
					{movie.title}
				</span>

				{year && (
					<span
						style={{
							color: "rgba(255,255,255,0.4)",
							display: "flex",
							fontSize: 28,
							marginTop: 16,
						}}
					>
						{year}
						{movie.runtime
							? ` · ${Math.floor(movie.runtime / 60)}h ${movie.runtime % 60}m`
							: ""}
					</span>
				)}

				{movie.overview && (
					<span
						style={{
							color: "rgba(255,255,255,0.3)",
							display: "flex",
							fontSize: 20,
							lineHeight: 1.5,
							marginTop: 24,
							maxWidth: 600,
							overflow: "hidden",
						}}
					>
						{movie.overview.length > 160
							? `${movie.overview.slice(0, 160)}...`
							: movie.overview}
					</span>
				)}

				{/* Branding */}
				<span
					style={{
						color: "rgba(255,255,255,0.2)",
						display: "flex",
						fontSize: 20,
						fontWeight: 700,
						marginTop: 40,
					}}
				>
					Miru
				</span>
			</div>
		</div>,
		{ ...size },
	);
}
