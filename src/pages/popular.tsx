import type { NextPage } from "next";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import { FiStar } from "react-icons/fi";
import { trpc } from "utils/trpc";

const getImage = (path: string) => {
  return `https://image.tmdb.org/t/p/original${path}`;
};

const Popular: NextPage = () => {
  const { query, pathname } = useRouter();
  const page = Array.isArray(query.page)
    ? Number(query.page[0])
    : Number(query.page ?? 1);

  const { data, isLoading } = trpc.movies.getPopular.useQuery({ page });

  if (isLoading) {
    return <div className="text-3xl text-white">LOADING</div>;
  }

  return (
    <div className="px-20 pt-20">
      <h1 className="text-3xl font-thin uppercase tracking-widest dark:text-white">
        Popular
      </h1>
      <p className="mt-1 font-thin dark:text-white">Movies</p>

      <div className="my-10 grid gap-16 md:grid-cols-3 lg:grid-cols-4">
        {data?.results?.map((movie) => {
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

      <div className="mb-8 flex w-full items-center justify-between gap-5 lg:px-20">
        {page && page === 1 && (
          <Link
            href={{
              pathname,
              query: {
                ...query,
                page: page - 1,
              },
            }}
            className="flex  h-10 items-center rounded bg-neutral-800 px-10 text-white dark:bg-neutral-100 dark:text-black"
          >
            Prev
          </Link>
        )}
        <Link
          href={{
            pathname,
            query: {
              ...query,
              page: page + 1,
            },
          }}
          className="ml-auto flex h-10 items-center rounded bg-neutral-800 px-10 text-white dark:bg-neutral-100 dark:text-black"
        >
          Next
        </Link>
      </div>
    </div>
  );
};

export default Popular;
