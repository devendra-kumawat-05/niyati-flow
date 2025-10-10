import { router, protectedProcedure } from '@/server/trpc';
import { z } from 'zod';
import { db } from '@/db';
import { conversations, messages } from '@/db/schema';
import { eq, desc, and } from 'drizzle-orm';

export const chatRouter = router({
  // Get all conversations for the current user
  getConversations: protectedProcedure.query(async ({ ctx }) => {
    return await db
      .select({
        id: conversations.id,
        title: conversations.title,
        createdAt: conversations.createdAt,
        updatedAt: conversations.updatedAt,
      })
      .from(conversations)
      .orderBy(desc(conversations.updatedAt));
  }),

  // Get a specific conversation with its messages
  getConversation: protectedProcedure
    .input(z.object({ conversationId: z.number() }))
    .query(async ({ input, ctx }) => {
      if (!input.conversationId || input.conversationId <= 0) {
        throw new Error('Invalid conversation ID');
      }

      const conversation = await db
        .select()
        .from(conversations)
        .where(eq(conversations.id, input.conversationId))
        .limit(1);

      if (!conversation[0]) {
        throw new Error('Conversation not found');
      }

      const conversationMessages = await db
        .select({
          id: messages.id,
          content: messages.content,
          role: messages.role,
          createdAt: messages.createdAt,
        })
        .from(messages)
        .where(eq(messages.conversationId, input.conversationId))
        .orderBy(messages.createdAt);

      return {
        ...conversation[0],
        messages: conversationMessages,
      };
    }),

  // Create a new conversation
  createConversation: protectedProcedure
    .input(z.object({ title: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const newConversation = await db
        .insert(conversations)
        .values({
          title: input.title,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        })
        .returning();

      return newConversation[0];
    }),

  // Send a message to a conversation
  sendMessage: protectedProcedure
    .input(
      z.object({
        conversationId: z.number(),
        content: z.string(),
        role: z.enum(['user', 'assistant']),
      })
    )
    .mutation(async ({ input, ctx }) => {
      // Insert the message
      const newMessage = await db
        .insert(messages)
        .values({
          conversationId: input.conversationId,
          userId: ctx.user.id,
          content: input.content,
          role: input.role,
          createdAt: new Date().toISOString(),
        })
        .returning();

      // Update conversation's updatedAt timestamp
      await db
        .update(conversations)
        .set({ updatedAt: new Date().toISOString() })
        .where(eq(conversations.id, input.conversationId));

      return newMessage[0];
    }),
});
