import { router, protectedProcedure } from '@/server/trpc';
import { z } from 'zod';
import { db } from '@/db';
import { conversations, messages } from '@/db/schema';
import { eq, desc, and, sql } from 'drizzle-orm';

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
      .where(eq(conversations.userId, ctx.user.id))
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
        .where(
          and(
            eq(conversations.id, input.conversationId),
            eq(conversations.userId, ctx.user.id)
          )
        )
        .limit(1);

      if (!conversation[0]) {
        throw new Error('Conversation not found or access denied');
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
          userId: ctx.user.id,
          title: 'New Chat', // Default title, will be updated with first message
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        })
        .returning();

      return newConversation[0];
    }),

  // Update conversation title
  updateConversationTitle: protectedProcedure
    .input(z.object({
      conversationId: z.number(),
      title: z.string().min(1, 'Title cannot be empty')
    }))
    .mutation(async ({ input, ctx }) => {
      const [conversation] = await db
        .update(conversations)
        .set({ 
          title: input.title,
          updatedAt: new Date().toISOString()
        })
        .where(
          and(
            eq(conversations.id, input.conversationId),
            eq(conversations.userId, ctx.user.id)
          )
        )
        .returning();

      if (!conversation) {
        throw new Error('Conversation not found or access denied');
      }

      return conversation;
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
      // Use a regular try/catch instead of transaction
      try {
        // Insert the message
        const [message] = await db
          .insert(messages)
          .values({
            conversationId: input.conversationId,
            userId: ctx.user.id,
            content: input.content,
            role: input.role,
            createdAt: new Date().toISOString(),
          })
          .returning();

        // If this is the first user message, update the conversation title
        if (input.role === 'user') {
          const [existingMessages] = await db
            .select({ count: sql<number>`count(*)` })
            .from(messages)
            .where(
              and(
                eq(messages.conversationId, input.conversationId),
                eq(messages.role, 'user')
              )
            );

          if (existingMessages.count === 1) {
            // Use first 30 characters of the message as the title
            const title = input.content.length > 30 
              ? `${input.content.substring(0, 30)}...` 
              : input.content;
              
            await db
              .update(conversations)
              .set({ 
                title,
                updatedAt: new Date().toISOString() 
              })
              .where(eq(conversations.id, input.conversationId));
          }
        }

        // Update conversation timestamp
        await db
          .update(conversations)
          .set({ updatedAt: new Date().toISOString() })
          .where(eq(conversations.id, input.conversationId));

        return message;
      } catch (error) {
        console.error('Error in sendMessage:', error);
        throw new Error('Failed to send message');
      }
    }),
});
