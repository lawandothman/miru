import { gql, useQuery } from "@apollo/client";
import { ProfilePicture } from "components/Avatar";
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
      {data?.user && (
        <>
          <div className="flex items-center gap-4">
            <ProfilePicture size="lg" user={data.user} />
            <h1 className="text-3xl  dark:text-neutral-300">
              {data?.user.name}
            </h1>
          </div>

          {data?.user.matches && data.user.matches.length > 0 && (
            <>
              <h3 className="my-8 text-xl font-thin text-neutral-300">
                Your matches with {data?.user.name}
              </h3>
              <MoviesList movies={data?.user.matches} />
            </>
          )}
        </>
      )}
    </div>
  );
};

export default User;
