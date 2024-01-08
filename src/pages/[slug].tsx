import type { GetStaticProps, NextPage } from "next";
import Head from "next/head";
import { LoadingPage } from "~/components/Loading";
import { NotFoundPage } from "~/components/NotFound";
import { PostView } from "~/components/PostView";
import { ProfileImage } from "~/components/ProfileImage";
import { generateSSGHelper } from "~/server/helpers/ssgHelper";
import { api } from "~/utils/api";

const ProfileFeed = (props: { userId: string }) => {
  const { data, isLoading } = api.posts.getPostsByUserId.useQuery({
    userId: props.userId,
  });

  if (isLoading) return <LoadingPage />;
  if (!data || data.length === 0) return <div>User has not posted</div>;

  return (
    <div className="flex flex-col">
      {data.map((fullPost) => (
        <PostView {...fullPost} key={fullPost.post.id} />
      ))}
    </div>
  );
};

const ProfilePage: NextPage<{ username: string }> = ({ username }) => {
  const { data, isLoading } = api.profile.getUserByUsername.useQuery({
    username,
  });

  if (isLoading) return <LoadingPage />;

  if (!data) return <NotFoundPage resourceName="Profile" />;

  return (
    <>
      <Head>
        <title>{data.username}</title>
      </Head>
      <div className="relative h-44 bg-slate-600">
        <ProfileImage
          user={data}
          className="absolute bottom-0 left-0 -mb-16 ml-6 rounded-full border-4 border-black bg-black"
          size={128}
        />
      </div>
      <div className="h-16" />
      <div className="py-4 px-6 text-2xl font-bold">{data.username}</div>
      <div className="border-b border-slate-400" />
      <ProfileFeed userId={data.id} />
    </>
  );
};

export const getStaticProps: GetStaticProps = async (context) => {
  const ssg = generateSSGHelper();

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
