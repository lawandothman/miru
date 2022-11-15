import Image from "next/image";
import Link from "next/link";
import type { FC } from "react";
import { useState } from "react";
import type { Movie } from "types/tmdbAPI";
import { cn } from "utils/cn";
import { getImage } from "utils/image";

interface MoviesListProps {
  movies?: Movie[];
}

export const MoviesList: FC<MoviesListProps> = ({ movies }) => {
  return (
    <div className="my-8">
      <div className="grid grid-cols-1 gap-y-10 gap-x-6 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 xl:gap-x-8">
        {movies?.map((movie) => {
          return <BlurImage key={movie.id} movie={movie} />;
        })}
      </div>
    </div>
  );
};

const BlurImage = ({ movie }: { movie: Movie }) => {
  const [isLoading, setLoading] = useState(true);
  return (
    <Link href={`/movie/${movie.id}`} className="group h-full">
      <div className="aspect-w-1 aspect-h-1 xl:aspect-w-7 xl:aspect-h-8 relative h-[500px] w-full overflow-hidden rounded-lg lg:h-[500px]">
        {movie.poster_path && (
          <Image
            alt={movie.title ?? ""}
            src={getImage(movie.poster_path)}
            layout="fill"
            objectFit="cover"
            className={cn(
              "absolute top-0 left-0 bottom-0 right-0 min-h-full min-w-full duration-200 ease-in-out group-hover:scale-110",
              isLoading ? "blur-2xl" : "blur-0"
            )}
            onLoadingComplete={() => setLoading(false)}
          />
        )}
      </div>
      <h3 className="mt-4 text-center text-sm dark:text-neutral-300">
        {movie.title}
      </h3>
    </Link>
  );
};
