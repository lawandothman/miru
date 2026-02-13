import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
	return new ImageResponse(
		<div
			style={{
				alignItems: "center",
				background: "#121212",
				borderRadius: 40,
				display: "flex",
				height: "100%",
				justifyContent: "center",
				width: "100%",
			}}
		>
			<span
				style={{
					color: "#fff",
					fontSize: 100,
					fontWeight: 800,
					letterSpacing: "-0.03em",
				}}
			>
				M
			</span>
		</div>,
		{ ...size },
	);
}
