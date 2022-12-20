import type {
  GetServerSidePropsContext,
  InferGetServerSidePropsType,
  NextPage,
} from "next";
import { getProviders, getSession, signIn } from "next-auth/react";
import { FiFacebook } from "react-icons/fi";

const SignIn: NextPage<
  InferGetServerSidePropsType<typeof getServerSideProps>
> = ({ providers }) => {
  return (
    <div className="mx-auto flex h-screen max-w-md flex-col items-center justify-center gap-8">
      <h1 className="text-4xl text-white">Log in</h1>
      {providers &&
        Object.values(providers).map((provider) => (
          <button
            onClick={() =>
              signIn(provider.id, {
                callbackUrl: `${window.location.origin}/`,
              })
            }
            key={provider.name}
            className="flex w-72 items-center justify-center gap-4 rounded bg-white p-4 text-neutral-900 "
          >
            <FiFacebook className="fill-neutral-900" />
            Login with {provider.name}
          </button>
        ))}
    </div>
  );
};

export const getServerSideProps = async (
  context: GetServerSidePropsContext
) => {
  const { req, res } = context;
  const session = await getSession({ req });

  if (session && res) {
    res.writeHead(302, {
      Location: "/",
    });
    res.end();
    return;
  }

  const providers = await getProviders();

  return {
    props: {
      providers,
    },
  };
};

export default SignIn;
