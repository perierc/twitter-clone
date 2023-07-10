import type { User } from "@clerk/nextjs/dist/api";
import { clerkClient } from "@clerk/nextjs/server";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

import {
  createTRPCRouter,
  privateProcedure,
  publicProcedure,
} from "~/server/api/trpc";

const filterUserForClient = (user: User) => {
  return {
    id: user.id,
    username: user.username,
    profileImageUrl: user.profileImageUrl,
  };
};

export const postsRouter = createTRPCRouter({
  getAll: publicProcedure.query(async ({ ctx }) => {
    const posts = await ctx.prisma.post.findMany({
      take: 100,
      orderBy: { createdAt: "desc" },
    });

    const users = (
      await clerkClient.users.getUserList({
        userId: posts.map((post) => post.authorId),
        limit: 100,
      })
    ).map(filterUserForClient);

    return posts.map((post) => {
      const author = users.find((user) => user.id === post.authorId);

      if (!author || !author.username) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Author of the post not found",
        });
      }

      return {
        post,
        author: { ...author, username: author.username },
      };
    });
  }),

  create: privateProcedure
    .input(
      z.object({
        content: z
          .string()
          .min(1, { message: "Post must have at least 1 character" })
          .max(280, { message: "Post must have at most 280 characters" })
          .refine((value) => value.endsWith("🙂"), {
            message: 'Post must end with the "🙂" emoji',
          }),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const authorId = ctx.userId;

      const post = await ctx.prisma.post.create({
        data: {
          content: input.content,
          authorId,
        },
      });

      return post;
    }),
});
