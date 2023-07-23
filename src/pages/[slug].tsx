import { createProxySSGHelpers } from "@trpc/react-query/ssg";
import type { GetStaticProps, NextPage } from "next";
import Head from "next/head";
import superjson from "superjson";
import { LoadingPage } from "~/components/Loading";
import { appRouter } from "~/server/api/root";
import { prisma } from "~/server/db";
import { api } from "~/utils/api";
import Image from "next/image";

const ProfilePage: NextPage<{ username: string }> = ({ username }) => {
  const { data, isLoading } = api.profile.getUserByUsername.useQuery({
    username,
  });

  if (isLoading) return <LoadingPage />;

  if (!data) return <div>Not found</div>;

  return (
    <>
      <Head>
        <title>{data.username}</title>
      </Head>
      <div className="relative h-44 bg-slate-600">
        <Image
          src={data.profileImageUrl}
          alt={`${data.username ?? ""}'s profile image`}
          className="absolute bottom-0 left-0 -mb-16 ml-6 rounded-full border-4 border-black"
          width={128}
          height={128}
        />
      </div>
      <div className="h-16" />
      <div className="py-4 px-6 text-2xl font-bold">{data.username}</div>
      <div className="border-b border-slate-400" />
    </>
  );
};

export const getStaticProps: GetStaticProps = async (context) => {
  const ssg = createProxySSGHelpers({
    router: appRouter,
    ctx: { prisma, userId: null },
    transformer: superjson,
  });

  const slug = context.params?.slug as string;

  await ssg.profile.getUserByUsername.prefetch({ username: slug });

  return {
    props: {
      trpcState: ssg.dehydrate(),
      username: slug,
    },
  };
};

export const getStaticPaths = () => {
  return {
    paths: [],
    fallback: "blocking",
  };
};

export default ProfilePage;
