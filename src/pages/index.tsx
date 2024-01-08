import { useUser } from "@clerk/nextjs";
import { type NextPage } from "next";

import { api } from "~/utils/api";

import { LoadingPage, LoadingSpinner } from "~/components/Loading";
import { PostView } from "~/components/PostView";
import { ProfileImage } from "~/components/ProfileImage";
import { useState } from "react";
import { toast } from "react-hot-toast";

const CreatePostWizard = () => {
  const { user } = useUser();

  const [input, setInput] = useState("");

  const ctx = api.useContext();

  const { mutate: createPost, isLoading: isPosting } =
    api.posts.create.useMutation({
      onSuccess: async () => {
        await ctx.posts.getAll.invalidate();
        setInput("");
        toast.success("Posted!");
      },
      onError: (err) => {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        const errors: { message: string }[] = JSON.parse(err.message);
        errors.forEach((error) => toast.error(error.message));
      },
    });

  const isPostButtonDisabled = isPosting || input === "";

  if (!user) return null;

  return (
    <div className="flex gap-3 border-b border-slate-400 py-4 px-6">
      <ProfileImage user={user} />
      <textarea
        className="ml-4 flex-grow resize-none bg-transparent outline-none"
        placeholder="Post whatever you want, but end it with a simple smile! 🙂"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !isPostButtonDisabled) {
            createPost({ content: input });
          }
        }}
        disabled={isPosting}
      />
      <button
        className={
          "align-center flex items-center rounded border px-6 " +
          (isPostButtonDisabled
            ? "border-slate-600 text-slate-600"
            : "bg-blue-700")
        }
        onClick={() => createPost({ content: input })}
        disabled={isPostButtonDisabled}
      >
        {isPosting && <LoadingSpinner size={16} />}
        <span className={isPosting ? "pl-3" : ""}>
          Post
          {isPosting && "ing..."}
        </span>
      </button>
    </div>
  );
};

const Feed = () => {
  const { data, isLoading: postsLoading } = api.posts.getAll.useQuery();

  if (postsLoading) {
    return <LoadingPage />;
  }

  if (!data) {
    return <div>Something went wrong</div>;
  }

  return (
    <div className="flex flex-col">
      {data.map((fullPost) => (
        <PostView {...fullPost} key={fullPost.post.id} />
      ))}
    </div>
  );
};

const Home: NextPage = () => {
  const { isSignedIn } = useUser();

  // Start loading posts as soon as possible
  api.posts.getAll.useQuery();

  return (
    <>
      {isSignedIn && <CreatePostWizard />}
      <Feed />
    </>
  );
};

export default Home;
