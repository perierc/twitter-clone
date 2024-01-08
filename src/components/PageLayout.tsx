import { SignInButton, SignOutButton, useUser } from "@clerk/nextjs";
import Link from "next/link";
import type { PropsWithChildren } from "react";
import { ProfileImage } from "~/components/ProfileImage";

export const PageLayout = ({ children }: PropsWithChildren) => {
  const { user, isSignedIn, isLoaded } = useUser();

  if (!isLoaded) {
    return <div />;
  }

  return (
    <main className="flex min-h-screen justify-center">
      <div className="w-full border-x border-slate-400 md:max-w-2xl">
        <div className="flex items-center border-b-4 border-slate-400 p-4">
          <Link href="/">
            <div className="text-4xl">Simple Smiler 🙂</div>
          </Link>
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
                <ProfileImage user={user} />
              </div>
            </div>
          )}
        </div>
        {children}
      </div>
    </main>
  );
};
