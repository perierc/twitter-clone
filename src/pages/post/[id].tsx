import type { GetStaticProps, NextPage } from "next";
import Head from "next/head";
import { LoadingPage } from "~/components/Loading";
import { NotFoundPage } from "~/components/NotFound";
import { PostView } from "~/components/PostView";
import { generateSSGHelper } from "~/server/helpers/ssgHelper";
import { api } from "~/utils/api";

const PostPage: NextPage<{ id: string }> = ({ id }) => {
  const { data, isLoading } = api.posts.getById.useQuery({
    id,
  });

  if (isLoading) return <LoadingPage />;

  if (!data) return <NotFoundPage resourceName="Post" />;

  return (
    <>
      <Head>
        <title>{`${data.post.content} - ${data.author.username}`}</title>
      </Head>
      <PostView {...data} />
    </>
  );
};

export const getStaticProps: GetStaticProps = async (context) => {
  const ssg = generateSSGHelper();

  const id = context.params?.id as string;

  await ssg.posts.getById.prefetch({ id });

  return {
    props: {
      trpcState: ssg.dehydrate(),
      id,
    },
  };
};

export const getStaticPaths = () => {
  return {
    paths: [],
    fallback: "blocking",
  };
};

export default PostPage;
