import { Loader } from "components/Loader";
import { MoviesList } from "components/MoviesList";
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

  if (loading) {
    return <Loader />;
  }

  return (
    <div className="px-20 pt-20">
      <PageHeader title="Watchlist" />
      <MoviesList movies={data?.watchlist} />
    </div>
  );
};

export default Watchlist;
