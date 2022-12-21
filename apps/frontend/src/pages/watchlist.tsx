import { Loader } from "components/Loader";
import { MoviesList } from "components/MoviesList";
import { PageHeader } from "components/PageHeader";
import type { NextPage } from "next";
import { useQuery, gql } from "@apollo/client";
import type { Movie } from "__generated__/resolvers-types";

const GET_WATCHLIST = gql`
  query Watchlist {
    watchlist {
      id
      title
      posterUrl
    }
  }
`;

const Watchlist: NextPage = () => {
  const { data, loading } = useQuery<{ watchlist: Movie[] }>(GET_WATCHLIST);

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
