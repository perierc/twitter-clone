import Image from "next/image";
import type { RouterOutputs } from "~/utils/api";

type User = RouterOutputs["posts"]["getAll"][number]["author"];
type UserWithNullableUsername = Omit<User, "username"> & {
  username: string | null;
};

export const ProfileImage = (props: {
  user: UserWithNullableUsername;
  size?: number;
  className?: string;
}) => {
  const size = props.size ?? 56;

  return (
    <Image
      src={props.user.profileImageUrl}
      alt={`${props.user.username ?? ""}'s profile image`}
      className={props.className ?? "h-14 w-14 rounded-full"}
      width={size}
      height={size}
    />
  );
};
