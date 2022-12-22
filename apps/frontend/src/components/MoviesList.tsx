import { gql, useMutation } from "@apollo/client";
import { useSession } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import type { FC } from "react";
import { useState } from "react";
import { FiMinus, FiPlus } from "react-icons/fi";
import { cn } from "utils/cn";
import { getImage } from "utils/image";
import type { Movie } from "__generated__/resolvers-types";

interface MoviesListProps {
  movies?: Array<Movie | null>;
}

const ADD_TO_WATCHLIST = gql`
  mutation AddMovieToWatchlist($movieId: ID!) {
    addMovieToWatchlist(movieId: $movieId) {
      id
      inWatchlist
    }
  }
`;

const REMOVE_FROM_WATCHLIST = gql`
  mutation RemoveMovieFromWatchlist($movieId: ID!) {
    removeMovieFromWatchlist(movieId: $movieId) {
      id
      inWatchlist
    }
  }
`;

export const LoadingSkeleton = () => {
  return (
    <div className="my-8">
      <div className="grid grid-cols-1 gap-y-10 gap-x-6 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 xl:gap-x-8">
        {new Array(24).fill(true)?.map((item, idx) => {
          return (
            <div key={idx} className="h-full w-full">
              <div className="h-[500px] w-full rounded-lg lg:h-[500px]">
                <div className="min-h-full min-w-full animate-pulse bg-neutral-700" />
              </div>
              <div className="mx-auto mt-4 h-2.5 w-48 animate-pulse rounded-full bg-gray-200 dark:bg-neutral-700"></div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export const MoviesList: FC<MoviesListProps> = ({ movies }) => {
  return (
    <div className="my-8">
      <div className="grid grid-cols-1 gap-y-10 gap-x-6 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 xl:gap-x-8">
        {movies?.map((movie) => {
          return <BlurImage key={movie?.id} movie={movie} />;
        })}
      </div>
    </div>
  );
};

const BlurImage = ({ movie }: { movie: Movie | null }) => {
  const [isLoading, setLoading] = useState(true);
  const { data: session } = useSession();
  const [addToWatchlist] = useMutation<Movie, { movieId?: string }>(
    ADD_TO_WATCHLIST
  );
  const [removeFromWatchlist] = useMutation<Movie, { movieId?: string }>(
    REMOVE_FROM_WATCHLIST
  );
  return (
    <div className="h-full w-full">
      <div className="aspect-w-1 aspect-h-1 xl:aspect-w-7 xl:aspect-h-8 relative h-[500px] w-full overflow-hidden rounded-lg lg:h-[500px]">
        {movie?.posterUrl && (
          <Link href={`/movie/${movie?.id}`}>
            <Image
              alt={movie?.title ?? ""}
              src={getImage(movie?.posterUrl)}
              blurDataURL={getImage(movie?.posterUrl)}
              fill
              loading="lazy"
              sizes="(max-width: 768px) 100vw,
              (max-width: 1200px) 50vw,
              25vw"
              className={cn(
                "absolute top-0 left-0 bottom-0 right-0 min-h-full min-w-full object-cover",
                isLoading ? "animate-pulse bg-neutral-700" : "blur-0"
              )}
              onLoadingComplete={() => setLoading(false)}
            />
          </Link>
        )}
      </div>
      {isLoading ? (
        <div className="mx-auto mt-4 h-2.5 w-48 animate-pulse rounded-full bg-gray-200 dark:bg-neutral-700"></div>
      ) : (
        <h3 className="mt-4 text-center text-sm dark:text-neutral-300">
          {movie?.title}
        </h3>
      )}
      {session && (
        <button
          onClick={() => {
            const movieId = movie?.id;
            if (movie?.inWatchlist) {
              removeFromWatchlist({
                variables: {
                  movieId,
                },
              });
            } else {
              addToWatchlist({
                variables: {
                  movieId,
                },
              });
            }
          }}
          className="mx-auto mb-8 mt-4 flex h-8 w-36 items-center justify-center gap-1 rounded-md border border-neutral-500 dark:text-neutral-300"
        >
          {movie?.inWatchlist ? <FiMinus /> : <FiPlus />}
          Watchlist
        </button>
      )}
    </div>
  );
};
