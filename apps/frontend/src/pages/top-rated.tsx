import { LoadingSkeleton, MoviesList } from "components/MoviesList";
import type { NextPage } from "next";
import { gql, useQuery } from "@apollo/client";
import { PageHeader } from "components/PageHeader";
import type { Movie } from "__generated__/resolvers-types";

const GET_TOP_RATED = gql`
  query Search {
    search(query: " ") {
      id
      title
      posterUrl
      inWatchlist
    }
  }
`;

const TopRated: NextPage = () => {
  const { data, loading } = useQuery<{ search: Movie[] }>(GET_TOP_RATED);

  return (
    <div className="px-20 pt-20">
      <PageHeader title="Top Rated" />
      {loading ? <LoadingSkeleton /> : <MoviesList movies={data?.search} />}
    </div>
  );
};

export default TopRated;
