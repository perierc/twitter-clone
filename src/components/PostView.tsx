import type { RouterOutputs } from "~/utils/api";
import Link from "next/link";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { ProfileImage } from "~/components/ProfileImage";

dayjs.extend(relativeTime);

type PostWithUser = RouterOutputs["posts"]["getAll"][number];
export const PostView = (props: PostWithUser) => {
  const { post, author } = props;
  return (
    <div className="flex gap-4 border-b border-slate-400 p-4" key={post.id}>
      <ProfileImage user={author} />
      <div className="flex flex-col overflow-hidden break-words">
        <div className="flex gap-2">
          <Link href={`/${author.username}`}>
            <span className="font-bold">{author.username}</span>
          </Link>
          <span className="text-slate-400">·</span>
          <span className="font-thin text-slate-400">
            {dayjs(post.createdAt).fromNow()}
          </span>
        </div>
        <Link href={`/post/${post.id}`}>{post.content}</Link>
      </div>
    </div>
  );
};
