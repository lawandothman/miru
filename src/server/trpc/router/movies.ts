import tmdbAPI from "services/tmdbAPI";
import type {
  GenreResponseType,
  PopularResponseType,
  TopRatedResponseType,
} from "types/tmdbAPI";
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
        page: z.number().optional(),
      })
    )
    .query<PopularResponseType>(async ({ input }) => {
      try {
        const res = await tmdbAPI.get("/3/movie/popular", {
          params: {
            page: input.page,
          },
        });
        return res.data;
      } catch (error) {
        console.log(error);
      }
    }),
  getTopRated: publicProcedure
    .input(
      z.object({
        page: z.number().optional(),
      })
    )
    .query<TopRatedResponseType>(async ({ input }) => {
      try {
        const res = await tmdbAPI.get("/3/movie/top_rated", {
          params: {
            page: input.page,
          },
        });
        return res.data;
      } catch (error) {
        console.log(error);
      }
    }),
});