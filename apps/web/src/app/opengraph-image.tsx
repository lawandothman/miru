import { ImageResponse } from "next/og";

export const alt = "Miru — Find movies to watch with your friends";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OGImage() {
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
						"radial-gradient(ellipse 60% 50% at 50% 50%, rgba(255,255,255,0.03) 0%, transparent 70%)",
					display: "flex",
					height: "100%",
					position: "absolute",
					width: "100%",
				}}
			/>

			<div
				style={{
					alignItems: "center",
					display: "flex",
					flexDirection: "column",
					gap: 24,
				}}
			>
				<span
					style={{
						color: "#fff",
						fontSize: 96,
						fontWeight: 800,
						letterSpacing: "-0.04em",
					}}
				>
					Miru
				</span>
				<span
					style={{
						color: "rgba(255,255,255,0.4)",
						fontSize: 28,
						fontWeight: 400,
					}}
				>
					The social way to pick your next movie
				</span>
			</div>

			{/* Bottom branding line */}
			<div
				style={{
					bottom: 40,
					color: "rgba(255,255,255,0.15)",
					display: "flex",
					fontSize: 16,
					position: "absolute",
				}}
			>
				miru-chi.vercel.app
			</div>
		</div>,
		{ ...size },
	);
}
