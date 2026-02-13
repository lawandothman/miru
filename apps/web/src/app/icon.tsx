import { ImageResponse } from "next/og";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
	return new ImageResponse(
		<div
			style={{
				alignItems: "center",
				background: "#121212",
				borderRadius: 8,
				display: "flex",
				height: "100%",
				justifyContent: "center",
				width: "100%",
			}}
		>
			<span
				style={{
					color: "#fff",
					fontSize: 20,
					fontWeight: 800,
					letterSpacing: "-0.02em",
				}}
			>
				M
			</span>
		</div>,
		{ ...size },
	);
}
