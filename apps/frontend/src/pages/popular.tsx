import { Loader } from "components/Loader";
import { MoviesList } from "components/MoviesList";
import { PageHeader } from "components/PageHeader";
import type { NextPage } from "next";
import { useQuery, gql } from "@apollo/client";
import type { Movie } from "__generated__/resolvers-types";

const GET_POPULAR = gql`
  query Search {
    search(query: " ") {
      id
      title
      posterUrl
      inWatchlist
    }
  }
`;

const Popular: NextPage = () => {
  const { data, loading } = useQuery<{ search: Movie[] }>(GET_POPULAR);

  if (loading) {
    return <Loader />;
  }

  return (
    <div className="px-20 pt-20">
      <PageHeader title="Popular" />
      <MoviesList movies={data?.search} />
    </div>
  );
};

export default Popular;
