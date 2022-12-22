import { LoadingSkeleton, MoviesList } from "components/MoviesList";
import { PageHeader } from "components/PageHeader";
import type { NextPage } from "next";
import { useQuery, gql } from "@apollo/client";
import type { Movie } from "__generated__/resolvers-types";
import { useEffect } from "react";

export const GET_WATCHLIST = gql`
  query Watchlist {
    watchlist {
      id
      title
      posterUrl
      inWatchlist
    }
  }
`;

const Watchlist: NextPage = () => {
  const { data, loading, refetch } = useQuery<{ watchlist: Movie[] }>(
    GET_WATCHLIST
  );

  useEffect(() => {
    refetch();
  }, [refetch]);


  return (
    <div className="px-20 pt-20">
      <PageHeader title="Watchlist" />
      {loading ? <LoadingSkeleton /> : <MoviesList movies={data?.watchlist} />}
    </div>
  );
};

export default Watchlist;
