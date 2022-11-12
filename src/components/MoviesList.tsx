import Image from "next/image";
import Link from "next/link";
import type { FC } from "react";
import { FiStar } from "react-icons/fi";
import type { Movie } from "types/tmdbAPI";
import { getImage } from "utils/image";

interface MoviesListProps {
  movies?: Movie[];
}

export const MoviesList: FC<MoviesListProps> = ({ movies }) => {
  return (
    <div className="my-10 grid gap-16 md:grid-cols-3 lg:grid-cols-4">
      {movies?.map((movie) => {
        return (
          <Link
            href={`/movie/${movie.id}`}
            className="flex flex-col items-center justify-center"
            key={movie.id}
          >
            {movie.poster_path && (
              <Image
                src={getImage(movie.poster_path)}
                alt={movie.title ?? "Movie"}
                width={342}
                height={512}
                placeholder="blur"
                blurDataURL={getImage(movie.poster_path)}
                className="delay-50 transition hover:scale-105"
              />
            )}
            <h3 className="mt-4 text-center dark:text-neutral-300">
              {movie.title} ({movie.release_date?.split("-")[0]})
            </h3>
            <div className="mt-2 flex items-center gap-1.5 dark:text-neutral-300">
              <FiStar
                size={15}
                className="fill-black dark:fill-neutral-300 dark:stroke-neutral-300"
              />
              <span>{movie.vote_average}</span>
            </div>
          </Link>
        );
      })}
    </div>
  );
};
