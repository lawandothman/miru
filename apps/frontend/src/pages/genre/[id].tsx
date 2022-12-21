import { gql, useQuery } from "@apollo/client";
import { Loader } from "components/Loader";
import { MoviesList } from "components/MoviesList";
import { PageHeader } from "components/PageHeader";
import type { NextPage } from "next";
import { useRouter } from "next/router";
import type { Movie } from "__generated__/resolvers-types";

const GET_BY_GENRE = gql`
  query MoviesByGenre($genreId: ID!) {
    moviesByGenre(genreId: $genreId) {
      id
      title
      posterUrl
      genres {
        name
      }
    }
  }
`;

const Genre: NextPage = () => {
  const { query } = useRouter();
  const genreId = Array.isArray(query.id) ? query.id[0] : query.id;
  const { data, loading } = useQuery<
    { moviesByGenre: Movie[] },
    { genreId?: string }
  >(GET_BY_GENRE, {
    variables: {
      genreId,
    },
  });

  if (loading) {
    return <Loader />;
  }

  return (
    <div className="px-20 pt-20">
      <PageHeader title={"Genre"} />
      <MoviesList movies={data?.moviesByGenre} />
    </div>
  );
};

export default Genre;
