import { Loader } from "components/Loader";
import { MoviesList } from "components/MoviesList";
import { PageHeader } from "components/PageHeader";
import { Pagination } from "components/Pagination";
import type { NextPage } from "next";
import { useRouter } from "next/router";
import { trpc } from "utils/trpc";

const Genre: NextPage = () => {
  const { query } = useRouter();
  const genreId = Array.isArray(query.id) ? Number(query.id) : Number(query.id);
  const page = Array.isArray(query.page)
    ? Number(query.page[0])
    : Number(query.page ?? 1);

  const { data, isLoading: moviesLoading } = trpc.movies.getByGenre.useQuery({
    id: genreId,
    page,
  });

  const { data: genresData, isLoading: genresLoading } =
    trpc.movies.getGenres.useQuery();

  const isLoading = genresLoading || moviesLoading;

  if (isLoading) {
    return <Loader />;
  }

  return (
    <div className="px-20 pt-20">
      <PageHeader
        title={
          genresData?.genres.filter((genre) => genre.id === genreId)[0]?.name ??
          "Genre"
        }
      />
      <MoviesList movies={data?.results} />
      <Pagination page={page} />
    </div>
  );
};

export default Genre;
