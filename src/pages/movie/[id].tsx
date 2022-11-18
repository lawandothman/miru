import type { NextPage } from "next";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import { getImage } from "utils/image";
import { trpc } from "utils/trpc";
import { getYear } from "date-fns";
import { FiLink, FiYoutube } from "react-icons/fi";
import { FaImdb } from "react-icons/fa";
import { Loader } from "components/Loader";

const Movie: NextPage = () => {
  const { query } = useRouter();
  const movieId = Array.isArray(query.id)
    ? Number(query.id[0])
    : Number(query.id);

  const { data: movie, isLoading } = trpc.movies.getDetails.useQuery({
    id: movieId,
  });

  const trailer = movie?.videos?.results?.find(
    (video) => video.type === "Trailer" && video.site === "YouTube"
  );

  const { data: session } = trpc.auth.getSession.useQuery();
  const { mutate: likeMovie } = trpc.movies.likeMovie.useMutation();
  const { mutate: dislikeMovie } = trpc.movies.dislikeMovie.useMutation();
  const { mutate: watchMovie } = trpc.movies.watchMovie.useMutation();

  if (isLoading) {
    return <Loader />;
  }

  return (
    <div className="flex flex-col px-8 pt-10">
      <div className="mx-auto flex flex-col gap-24 pt-10 md:flex-row">
        {movie?.poster_path && (
          <Image
            src={getImage(movie.poster_path)}
            alt={movie.title ?? "movie"}
            width={450}
            height={1000}
          />
        )}
        <div className="flex flex-col dark:text-white">
          <h1 className="text-4xl font-thin uppercase tracking-widest ">
            {movie?.title}
          </h1>
          <p className="mt-2 text-xl font-thin">{movie?.tagline}</p>
          <div className="mt-6 text-sm text-neutral-400">
            {movie?.spoken_languages?.map((lang) => (
              <span key={lang.iso_639_1}>{lang.name} / </span>
            ))}
            <span>
              {movie?.runtime && movie.runtime + " MIN / "}
              {movie?.release_date && getYear(new Date(movie?.release_date))}
            </span>
            <div className="mt-8 flex gap-3">
              {movie?.genres?.map((genre) => (
                <Link
                  href={`/genre/${genre.id}`}
                  className="rounded border border-neutral-400 p-2 text-xs tracking-wide"
                  key={genre.id}
                >
                  {genre.name}
                </Link>
              ))}
            </div>
            <p className="mt-8 max-w-xl text-neutral-400">{movie?.overview}</p>
            <div className=" mt-6 flex gap-3">
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
            </div>
            {session && session.user && (
              <div className="mt-12 flex gap-8">
                <button
                  onClick={() => {
                    watchMovie({
                      movieId: movie?.id ?? 1,
                      releaseDate: movie?.release_date ?? "",
                      title: movie?.title ?? "",
                    });
                  }}
                  className="rounded border p-2 text-black dark:bg-white"
                >
                  Seen it
                </button>
                <button
                  onClick={() => {
                    likeMovie({
                      movieId: movie?.id ?? 1,
                      releaseDate: movie?.release_date ?? "",
                      title: movie?.title ?? "",
                    });
                  }}
                  className="rounded border p-2 text-black dark:bg-white"
                >
                  Want to watch
                </button>
                <button
                  onClick={() => {
                    dislikeMovie({
                      movieId: movie?.id ?? 1,
                      releaseDate: movie?.release_date ?? "",
                      title: movie?.title ?? "",
                    });
                  }}
                  className="rounded border p-2 text-black dark:bg-white"
                >
                  Not Interested
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Movie;
