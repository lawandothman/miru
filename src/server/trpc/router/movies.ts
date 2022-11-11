import tmdbAPI from "services/tmdbAPI";
import type { GenreResponseType, PopularResponseType } from "types/tmdbAPI";
import { publicProcedure, router } from "../trpc";

export const moviesRouter = router({
  getGenres: publicProcedure.query<GenreResponseType>(async () => {
    try {
      const res = await tmdbAPI.get("/3/genre/movie/list");
      return res.data;
    } catch (error) {
      console.log(error);
    }
  }),
  getPopular: publicProcedure.query<PopularResponseType>(async () => {
    try {
      const res = await tmdbAPI.get("/3/movie/popular");
      return res.data;
    } catch (error) {
      console.log(error);
    }
  }),
});
