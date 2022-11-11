import tmdbAPI from "services/tmdbAPI";
import type { GenreResponseType, PopularResponseType } from "types/tmdbAPI";
import { z } from "zod";
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
  getPopular: publicProcedure
    .input(
      z.object({
        page: z.string().optional(),
      })
    )
    .query<PopularResponseType>(async ({ input }) => {
      try {
        const res = await tmdbAPI.get("/3/movie/popular", {
          params: {
            page: input.page,
          },
        });
        console.log(res.data);
        return res.data;
      } catch (error) {
        console.log(error);
      }
    }),
});
