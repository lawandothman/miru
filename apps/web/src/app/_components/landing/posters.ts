export const posters = {
	darkKnight: "/qJ2tW6WMUDux911r6m7haRef0WH.jpg",
	dune: "/d5NXSklXo0qyIYkgV94XAgMIckC.jpg",
	fightClub: "/pB8BM7pdSp6B6Ih7QZ4DrQ3PmJK.jpg",
	grandBudapest: "/eWdyYQreja6JGCzqHWXpWHDrrPo.jpg",
	inception: "/xlaY2zyzMfkhk0HSC5VUwzoZPU1.jpg",
	interstellar: "/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg",
	ladybird: "/gl66K7zRdtNYGrxyS2YDUP5ASZd.jpg",
	parasite: "/7IiTTgloJzvGI1TAYymCfbfl3vT.jpg",
	whiplash: "/7fn624j5lj3xTme2SgiLCeuedmO.jpg",
};

export function tmdb(path: string, size = "w342") {
	return `https://image.tmdb.org/t/p/${size}${path}`;
}
