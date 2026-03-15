import { ImageResponse } from "next/og";
import { trpc } from "@/lib/trpc/server";

export const alt = "User profile on Miru";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function UserOGImage({
	params,
}: {
	params: Promise<{ id: string }>;
}) {
	const { id } = await params;

	let user: {
		name: string | null;
		image: string | null | undefined;
		followerCount: number;
		followingCount: number;
	} | null = null;

	let watchlistCount = 0;

	try {
		const api = await trpc();
		user = await api.user.getById({ id });
		const watchlist = await api.watchlist.getUserWatchlist({
			limit: 1,
			userId: id,
		});
		watchlistCount = watchlist.length > 0 ? watchlist.length : 0;
	} catch {
		// fall through to fallback
	}

	if (!user) {
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

	return new ImageResponse(
		<div
			style={{
				alignItems: "center",
				background: "#060606",
				display: "flex",
				flexDirection: "column",
				height: "100%",
				justifyContent: "center",
				width: "100%",
			}}
		>
			{/* Subtle radial glow */}
			<div
				style={{
					background:
						"radial-gradient(ellipse 50% 40% at 50% 50%, rgba(255,200,100,0.04) 0%, transparent 70%)",
					display: "flex",
					height: "100%",
					position: "absolute",
					width: "100%",
				}}
			/>

			{/* Avatar */}
			{user.image ? (
				// oxlint-disable-next-line nextjs/no-img-element -- OG images use Satori which requires <img>
				<img
					src={user.image}
					alt=""
					width={120}
					height={120}
					style={{ borderRadius: 60, objectFit: "cover" }}
				/>
			) : (
				<div
					style={{
						alignItems: "center",
						background: "rgba(255,255,255,0.1)",
						borderRadius: 60,
						color: "rgba(255,255,255,0.6)",
						display: "flex",
						fontSize: 48,
						fontWeight: 700,
						height: 120,
						justifyContent: "center",
						width: 120,
					}}
				>
					{user.name?.charAt(0) ?? "?"}
				</div>
			)}

			{/* Name */}
			<span
				style={{
					color: "#fff",
					display: "flex",
					fontSize: 48,
					fontWeight: 800,
					letterSpacing: "-0.02em",
					marginTop: 24,
				}}
			>
				{user.name}
			</span>

			{/* Stats */}
			<div
				style={{
					color: "rgba(255,255,255,0.4)",
					display: "flex",
					fontSize: 24,
					gap: 32,
					marginTop: 16,
				}}
			>
				<span>{user.followerCount} followers</span>
				<span>{user.followingCount} following</span>
				{watchlistCount > 0 && <span>{watchlistCount} in watchlist</span>}
			</div>

			{/* Branding */}
			<span
				style={{
					bottom: 40,
					color: "rgba(255,255,255,0.15)",
					display: "flex",
					fontSize: 20,
					fontWeight: 700,
					position: "absolute",
				}}
			>
				Miru
			</span>
		</div>,
		{ ...size },
	);
}
