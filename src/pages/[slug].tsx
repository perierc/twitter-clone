import { type NextPage } from "next";
import Head from "next/head";

const ProfilePage: NextPage = () => {
  return (
    <>
      <Head>
        <title>Simple Smiler</title>
        <meta
          name="description"
          content="Post whatever you want, but end it with a simple smile! 🙂"
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="flex min-h-screen justify-center">
        <div>Profile view</div>
      </main>
    </>
  );
};

export default ProfilePage;
