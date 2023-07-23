import { type AppType } from "next/app";

import { api } from "~/utils/api";

import { ClerkProvider } from "@clerk/nextjs";
import Head from "next/head";
import { Toaster } from "react-hot-toast";
import { PageLayout } from "~/components/PageLayout";
import "~/styles/globals.css";

const MyApp: AppType = ({ Component, pageProps }) => {
  return (
    <ClerkProvider {...pageProps}>
      <Head>
        <title>Simple Smiler</title>
        <meta
          name="description"
          content="Post whatever you want, but end it with a simple smile! 🙂"
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Toaster />
      <PageLayout>
        <Component {...pageProps} />
      </PageLayout>
    </ClerkProvider>
  );
};

export default api.withTRPC(MyApp);
