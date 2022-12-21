import { Loader } from "components/Loader";
import { MoviesList } from "components/MoviesList";
import { PageHeader } from "components/PageHeader";
import type { NextPage } from "next";
import { useRouter } from "next/router";
import { gql, useQuery } from "@apollo/client";
import type { Movie } from "__generated__/resolvers-types";

const SEARCH = gql`
  query Search($query: String!) {
    search(query: $query) {
      id
      title
      posterUrl
    }
  }
`;

const Search: NextPage = () => {
  const router = useRouter();

  const searchQuery = Array.isArray(router.query.q)
    ? router.query.q[0]
    : router.query.q;

  const { data, loading } = useQuery<{ search: Movie[] }, { query?: string }>(
    SEARCH,
    {
      variables: { query: searchQuery },
    }
  );

  if (!searchQuery) {
    return <div>Ooops something went wrong</div>;
  }

  if (loading) {
    return <Loader />;
  }

  return (
    <div className="px-20 pt-20">
      <PageHeader title={searchQuery} subtitle="Search results" />
      <MoviesList movies={data?.search} />
    </div>
  );
};

export default Search;
