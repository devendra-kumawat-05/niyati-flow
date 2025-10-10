import { router, protectedProcedure } from '@/server/trpc';
import { z } from 'zod';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { db } from '@/db';
import { conversations, messages } from '@/db/schema';
import { eq, asc } from 'drizzle-orm';

// Lazy initialize Gemini client
function getGeminiClient() {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error('Gemini API key is not configured. Please add GEMINI_API_KEY to your .env file.');
  }
  return new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
}

export const aiRouter = router({
  generateResponse: protectedProcedure
    .input(
      z.object({
        conversationId: z.number(),
        message: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      // Get conversation
      const [conversation] = await db
        .select()
        .from(conversations)
        .where(eq(conversations.id, input.conversationId))
        .limit(1);

      if (!conversation) {
        throw new Error('Conversation not found');
      }

      // Get all messages for the conversation
      const conversationMessages = await db
        .select({
          id: messages.id,
          content: messages.content,
          role: messages.role,
          createdAt: messages.createdAt,
        })
        .from(messages)
        .where(eq(messages.conversationId, input.conversationId))
        .orderBy(asc(messages.createdAt));

      try {
        // Get Gemini client (will throw if API key is not configured)
        const genAI = getGeminiClient();
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash-latest' });

        // Build conversation history for Gemini
        const history = conversationMessages.map((msg) => ({
          role: msg.role === 'user' ? 'user' : 'model',
          parts: [{ text: msg.content }],
        }));

        // Start chat with history
        const chat = model.startChat({
          history,
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 500,
          },
        });

        // Send the new message
        const result = await chat.sendMessage(input.message);
        const response = await result.response;
        const aiResponse = response.text() || "I'm sorry, I couldn't generate a response.";

        return {
          response: aiResponse,
        };
      } catch (error: any) {
        console.error('Error calling Gemini API:', error);
        console.error('Error details:', error?.message || error);
        
        // Provide more specific error message
        if (error?.message?.includes('API_KEY_INVALID') || error?.status === 401) {
          throw new Error('Invalid Gemini API key. Please check your GEMINI_API_KEY in .env file.');
        } else if (error?.status === 429) {
          throw new Error('Gemini API rate limit exceeded. Please try again later.');
        } else if (error?.status === 500) {
          throw new Error('Gemini API server error. Please try again later.');
        }
        
        throw new Error(`Failed to generate AI response: ${error?.message || 'Unknown error'}`);
      }
    }),
});
