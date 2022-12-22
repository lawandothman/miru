import { gql, useQuery } from "@apollo/client";
import { MoviesList } from "components/MoviesList";
import { useRouter } from "next/router";
import { User } from "__generated__/resolvers-types";

const SEARCH_USER = gql`
  query User($userId: ID!) {
    user(id: $userId) {
      name
      image
      matches {
        id
        title
        posterUrl
        inWatchlist
      }
    }
  }
`;

const User = () => {
  const { query } = useRouter();
  const userId = Array.isArray(query.id) ? query.id[0] : query.id;
  const { data } = useQuery<{ user: User }, { userId?: string }>(SEARCH_USER, {
    variables: {
      userId,
    },
  });

  return (
    <div className="px-20 pt-20">
      <h1 className="text-3xl font-thin uppercase tracking-widest dark:text-white">
        {data?.user.name}
      </h1>
      <h3 className="mt-8 text-xl text-neutral-300 font-thin">Matches with Pedro</h3>
      {data?.user.matches && data.user.matches.length > 0 && (
        <MoviesList movies={data?.user.matches} />
      )}
    </div>
  );
};

export default User;
