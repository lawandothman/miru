import tmdbAPI from "services/tmdbAPI";
import type {
  GenreResponseType,
  MovieDetailResponseType,
  PaginatedMoviesResponseType,
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
    .query<PaginatedMoviesResponseType>(async ({ input }) => {
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
    .query<PaginatedMoviesResponseType>(async ({ input }) => {
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
  getUpcoming: publicProcedure
    .input(
      z.object({
        page: z.number().optional(),
      })
    )
    .query<PaginatedMoviesResponseType>(async ({ input }) => {
      try {
        const res = await tmdbAPI.get("/3/movie/upcoming", {
          params: {
            page: input.page,
          },
        });
        return res.data;
      } catch (error) {
        console.log(error);
      }
    }),
  getByGenre: publicProcedure
    .input(
      z.object({
        id: z.number(),
        page: z.number().optional(),
      })
    )
    .query(async ({ input }) => {
      try {
        const res = await tmdbAPI.get("/3/discover/movie", {
          params: {
            with_genres: input.id,
            page: input.page,
          },
        });
        return res.data;
      } catch (error) {
        console.log(error);
      }
    }),
  getDetails: publicProcedure
    .input(
      z.object({
        id: z.number().optional(),
      })
    )
    .query<MovieDetailResponseType>(async ({ input }) => {
      try {
        const res = await tmdbAPI.get(`/3/movie/${input.id}`, {
          params: {
            append_to_response: "videos",
          },
        });
        return res.data;
      } catch (error) {
        console.log(error);
      }
    }),
  search: publicProcedure
    .input(
      z.object({
        query: z.string(),
        page: z.number().optional(),
      })
    )
    .query<PaginatedMoviesResponseType>(async ({ input }) => {
      try {
        const res = await tmdbAPI.get(`/3/search/movie`, {
          params: {
            query: input.query,
            page: input.page,
          },
        });
        return res.data;
      } catch (error) {
        console.log(error);
      }
    }),
});
