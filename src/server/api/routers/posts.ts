import { clerkClient } from "@clerk/nextjs/server";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

import {
  createTRPCRouter,
  privateProcedure,
  publicProcedure,
} from "~/server/api/trpc";

import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { filterUserForClient } from "~/server/helpers/filterUserForClient";
import type { Post } from "@prisma/client";

const addUserDataToPosts = async (posts: Post[]) => {
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
};

// Create a new ratelimiter, that allows 2 requests per 15 seconds
const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(2, "15 s"),
  analytics: true,
});

export const postsRouter = createTRPCRouter({
  getAll: publicProcedure.query(async ({ ctx }) =>
    ctx.prisma.post
      .findMany({
        take: 100,
        orderBy: { createdAt: "desc" },
      })
      .then(addUserDataToPosts)
  ),

  getPostsByUserId: publicProcedure
    .input(z.object({ userId: z.string() }))
    .query(async ({ ctx, input }) =>
      ctx.prisma.post
        .findMany({
          where: { authorId: input.userId },
          take: 100,
          orderBy: { createdAt: "desc" },
        })
        .then(addUserDataToPosts)
    ),

  getById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const post = await ctx.prisma.post.findUnique({
        where: { id: input.id },
      });

      if (!post) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Post not found",
        });
      }

      return (await addUserDataToPosts([post]))[0];
    }),

  create: privateProcedure
    .input(
      z.object({
        content: z
          .string()
          .min(1, { message: "Post must have at least 1 character" })
          .max(280, { message: "Post must have at most 280 characters" })
          .refine((value) => value.endsWith("🙂"), {
            message: "Post must end with the 🙂 emoji",
          }),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const authorId = ctx.userId;

      const { success } = await ratelimit.limit(authorId);
      if (!success) throw new TRPCError({ code: "TOO_MANY_REQUESTS" });

      const post = await ctx.prisma.post.create({
        data: {
          content: input.content,
          authorId,
        },
      });

      return post;
    }),
});
