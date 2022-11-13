import { Loader } from "components/Loader";
import { MoviesList } from "components/MoviesList";
import { PageHeader } from "components/PageHeader";
import { Pagination } from "components/Pagination";
import type { NextPage } from "next";
import { useRouter } from "next/router";
import { trpc } from "utils/trpc";

const TopRated: NextPage = () => {
  const { query } = useRouter();
  const page = Array.isArray(query.page)
    ? Number(query.page[0])
    : Number(query.page ?? 1);

  const { data, isLoading } = trpc.movies.getTopRated.useQuery({ page });

  if (isLoading) {
    return <Loader />;
  }

  return (
    <div className="px-20 pt-20">
      <PageHeader title="Top Rated" />
      <MoviesList movies={data?.results} />
      <Pagination page={page} />
    </div>
  );
};

export default TopRated;
