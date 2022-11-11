import tmdbAPI from "services/tmdbAPI";
import type { Genre } from "types/tmdbAPI";
import { publicProcedure, router } from "../trpc";

export const moviesRouter = router({
  getGenres: publicProcedure.query<Genre[]>(async () => {
    try {
      return await (
        await tmdbAPI.get(`/3/genre/movie/list`)
      ).data.genres;
    } catch (error) {
      console.log(error);
    }
  }),
});
