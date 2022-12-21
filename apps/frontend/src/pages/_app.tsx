import { type AppType } from "next/app";
import { type Session } from "next-auth";
import { SessionProvider } from "next-auth/react";
import { ApolloProvider, ApolloClient, InMemoryCache } from "@apollo/client";

import { Sidebar } from "components/Sidebar";

import "styles/globals.css";

const client = new ApolloClient({
  uri: "http://localhost:4000/graphql",
  cache: new InMemoryCache(),
});

const MyApp: AppType<{ session: Session | null }> = ({
  Component,
  pageProps: { session, ...pageProps },
}) => {
  return (
    <SessionProvider session={session}>
      <ApolloProvider client={client}>
        <Sidebar />
        <main className="lg:pl-60">
          <Component {...pageProps} />
        </main>
      </ApolloProvider>
    </SessionProvider>
  );
};

export default MyApp;
