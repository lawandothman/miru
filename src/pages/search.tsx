import { MoviesList } from "components/MoviesList";
import { PageHeader } from "components/PageHeader";
import { Pagination } from "components/Pagination";
import type { NextPage } from "next";
import { useRouter } from "next/router";
import { trpc } from "utils/trpc";

const Search: NextPage = () => {
  const router = useRouter();

  const searchQuery = Array.isArray(router.query.q)
    ? router.query.q[0]
    : router.query.q;

  const page = Array.isArray(router.query.page)
    ? Number(router.query.page[0])
    : Number(router.query.page);

  if (!searchQuery) {
    return <div>Ooops something went wrong</div>;
  }

  const { data } = trpc.movies.search.useQuery({ query: searchQuery });

  return (
    <div className="px-20 pt-20">
      <PageHeader title={searchQuery} subtitle="Search results" />
      <MoviesList movies={data?.results} />
      {data?.page && data.page > 1 && <Pagination page={page} />}
    </div>
  );
};

export default Search;
