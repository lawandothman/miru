import tmdbAPI from "../../../services/tmdbApi";
import { publicProcedure, router } from "../trpc";

interface IGenre {
  id: number;
  name: string;
}

export const moviesRouter = router({
  getGenres: publicProcedure.query<IGenre[]>(async () => {
    try {
      return await (
        await tmdbAPI.get(`/3/genre/movie/list`)
      ).data.genres;
    } catch (error) {
      console.log(error);
    }
  }),
});
