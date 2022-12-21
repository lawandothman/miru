import type { NextPage } from "next";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import { getImage } from "utils/image";
import { getYear } from "date-fns";
import { Loader } from "components/Loader";
import { gql, useMutation, useQuery } from "@apollo/client";
import { Movie } from "__generated__/resolvers-types";

const GET_BY_ID = gql`
  query Movie($movieId: ID!) {
    movie(id: $movieId) {
      posterUrl
      title
      releaseDate
      overview
      genres {
        name
        id
      }
    }
  }
`;

const ADD_TO_WATCHLIST = gql`
  mutation AddMovieToWatchlist($movieId: ID!) {
    addMovieToWatchlist(movieId: $movieId) {
      id
    }
  }
`;

const Movie: NextPage = () => {
  const { query } = useRouter();
  const movieId = Array.isArray(query.id) ? query.id[0] : query.id;

  const { data, loading } = useQuery<{ movie: Movie }, { movieId?: string }>(
    GET_BY_ID,
    {
      variables: {
        movieId,
      },
    }
  );

  const [mutateFunction] = useMutation<Movie, { movieId?: string }>(
    ADD_TO_WATCHLIST
  );

  if (loading) {
    return <Loader />;
  }
  return (
    <div className="flex flex-col px-8 pt-10">
      <div className="mx-auto flex flex-col gap-24 pt-10 md:flex-row">
        {data?.movie?.posterUrl && (
          <Image
            src={getImage(data.movie.posterUrl)}
            alt={data.movie.title ?? "movie"}
            width={450}
            height={1000}
          />
        )}
        <div className="flex flex-col dark:text-white">
          <h1 className="text-4xl font-thin uppercase tracking-widest ">
            {data?.movie.title}
          </h1>
          {/* <p className="mt-2 text-xl font-thin">{movie?.tagline}</p> */}
          <div className="mt-6 text-sm text-neutral-400">
            {/* {movie?.spoken_languages?.map((lang) => (
              <span key={lang.iso_639_1}>{lang.name} / </span>
            ))} */}
            <span>
              {/* {movie?.runtime && movie.runtime + " MIN / "} */}
              {data?.movie.releaseDate &&
                getYear(new Date(data?.movie.releaseDate))}
            </span>
            <div className="mt-8 flex gap-3">
              {data?.movie.genres?.map((genre) => (
                <Link
                  href={`/genre/${genre?.id}`}
                  className="rounded border border-neutral-400 p-2 text-xs tracking-wide"
                  key={genre?.id}
                >
                  {genre?.name}
                </Link>
              ))}
            </div>
            <p className="mt-8 max-w-xl text-neutral-400">
              {data?.movie.overview}
            </p>
            {/* <div className=" mt-6 flex gap-3">
              {movie?.homepage && (
                <Link
                  target="_blank"
                  rel="noreferrer noopener"
                  href={movie?.homepage}
                  className="inline-flex items-center gap-2"
                >
                  <FiLink size={20} />
                  Homepage
                </Link>
              )}
              {movie?.imdb_id && (
                <Link
                  target="_blank"
                  rel="noreferrer noopener"
                  href={`https://imdb.com/title/${movie.imdb_id}`}
                  className="inline-flex items-center justify-center gap-2"
                >
                  <FaImdb size={20} />
                  IMDB
                </Link>
              )}
              {trailer && (
                <Link
                  target="_blank"
                  rel="noreferrer noopener"
                  href={`https://youtube.com/watch?v=${trailer.key}`}
                  className="inline-flex items-center justify-center gap-2"
                >
                  <FiYoutube size={20} />
                  Trailer
                </Link>
              )}
            </div> */}
          </div>
          <button
            onClick={() =>
              mutateFunction({
                variables: {
                  movieId,
                },
              })
            }
            className="mt-8 w-36 rounded bg-white p-2 text-black"
          >
            Add to Watchlist
          </button>
        </div>
      </div>
    </div>
  );
};

export default Movie;
