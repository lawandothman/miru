import { type NextPage } from "next";
import { trpc } from "utils/trpc";

const Home: NextPage = () => {
  const { data: session } = trpc.auth.getSession.useQuery();
  const { data: likedMovies } = trpc.movies.getLiked.useQuery(undefined, {
    enabled: !!session,
  });
  const { data: dislikedMovies } = trpc.movies.getDisliked.useQuery(undefined, {
    enabled: !!session,
  });
  const { data: watchedMovies } = trpc.movies.getWatched.useQuery(undefined, {
    enabled: !!session,
  });

  return (
    <div>
      <h1 className="mt-8 text-3xl text-white">Your Liked Movies</h1>
      <ul>
        {likedMovies?.map((movie) => (
          <li className=" text-white" key={movie.id}>
            {movie.title} ({movie.releaseDate})
          </li>
        ))}
      </ul>

      <h1 className=" mt-8 text-3xl text-white">Your Disliked Movies</h1>
      <ul>
        {dislikedMovies?.map((movie) => (
          <li className=" text-white" key={movie.id}>
            {movie.title} ({movie.releaseDate})
          </li>
        ))}
      </ul>
      <h1 className=" mt-8 text-3xl text-white">Your Watched Movies</h1>
      <ul>
        {watchedMovies?.map((movie) => (
          <li className=" text-white" key={movie.id}>
            {movie.title} ({movie.releaseDate})
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Home;
