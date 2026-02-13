import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
	return {
		background_color: "#060606",
		display: "standalone",
		name: "Miru",
		short_name: "Miru",
		start_url: "/",
		theme_color: "#121212",
	};
}
