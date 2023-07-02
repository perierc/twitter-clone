import { SignInButton, SignOutButton, useUser } from "@clerk/nextjs";
import { type NextPage } from "next";
import Head from "next/head";

import { api } from "~/utils/api";
import type { RouterOutputs } from "~/utils/api";

import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import Image from "next/image";

dayjs.extend(relativeTime);

const CreatePostWizard = () => {
  const { user } = useUser();

  if (!user) return null;

  console.log(user);

  return (
    <div className="flex gap-3 border-b border-slate-400 py-4 px-8">
      <Image
        src={user.profileImageUrl}
        alt="Profile image"
        className="rounded-full"
        width={56}
        height={56}
      />
      <input
        className="ml-4 flex-grow bg-transparent outline-none"
        placeholder="Post whatever you want, but end it with a simple smile! 🙂"
      />
    </div>
  );
};

type PostWithUser = RouterOutputs["posts"]["getAll"][number];
const PostView = (props: PostWithUser) => {
  const { post, author } = props;
  return (
    <div className="flex gap-4 border-b border-slate-400 p-4" key={post.id}>
      <Image
        src={author.profileImageUrl}
        alt={`${author.username}'s profile image`}
        className="rounded-full"
        width={56}
        height={56}
      />
      <div className="flex flex-col">
        <div className="flex gap-2">
          <span className="font-bold">{author.username}</span>
          <span className="text-slate-400">·</span>
          <span className="font-thin text-slate-400">
            {dayjs(post.createdAt).fromNow()}
          </span>
        </div>
        {post.content}
      </div>
    </div>
  );
};

const Home: NextPage = () => {
  const { user, isSignedIn } = useUser();

  const { data, isLoading } = api.posts.getAll.useQuery();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!data) {
    return <div>Something went wrong</div>;
  }

  return (
    <>
      <Head>
        <title>Simple Smiler</title>
        <meta
          name="description"
          content="Post anything you want, but finish with a simple smile 🙂"
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="flex h-screen justify-center">
        <div className="w-full border-x border-slate-400 md:max-w-2xl">
          <div className="flex items-center border-b-4 border-slate-400 p-4">
            <div className="text-4xl">Simple Smiler 🙂</div>
            {!isSignedIn ? (
              <div className="ml-auto flex content-center rounded border bg-blue-600 py-2 px-4">
                <SignInButton />
              </div>
            ) : (
              <div className="ml-auto flex content-center">
                <div className="mx-4 flex rounded border py-2 px-4">
                  <SignOutButton />
                </div>
                <div>
                  <Image
                    src={user.profileImageUrl}
                    alt="Profile image"
                    className="rounded-full"
                    width={56}
                    height={56}
                  />
                </div>
              </div>
            )}
          </div>
          <div className="flex flex-col">
            {isSignedIn && <CreatePostWizard />}
            {data?.map((fullPost) => (
              <PostView {...fullPost} key={fullPost.post.id} />
            ))}
          </div>
        </div>
      </main>
    </>
  );
};

export default Home;
