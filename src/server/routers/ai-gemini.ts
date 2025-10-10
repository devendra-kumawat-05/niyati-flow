import { router, protectedProcedure } from '@/server/trpc';
import { z } from 'zod';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { db } from '@/db';
import { conversations, messages } from '@/db/schema';
import { eq, asc } from 'drizzle-orm';

// Lazy initialize Gemini AI to avoid errors on startup
function getGenAI() {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error('Gemini API key is not configured');
  }
  return new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
}

export const aiGeminiRouter = router({
  generateResponse: protectedProcedure
    .input(
      z.object({
        conversationId: z.number(),
        message: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      // Check if API key is configured
      if (!process.env.GEMINI_API_KEY) {
        console.error('GEMINI_API_KEY is not configured');
        throw new Error('Gemini API key is not configured. Please add GEMINI_API_KEY to your .env file. Get your free key at https://makersuite.google.com/app/apikey');
      }

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
        // Initialize the model
        const genAI = getGenAI();
        const model = genAI.getGenerativeModel({ 
          model: 'gemini-2.5-flash',
        });

        // Build conversation history for Gemini chat
        const history = conversationMessages.map((msg) => ({
          role: msg.role === 'user' ? 'user' : 'model',
          parts: [{ text: msg.content }],
        }));

        // Use chat session for better conversation handling
        const chat = model.startChat({
          history: history,
          generationConfig: {
            maxOutputTokens: 500,
            temperature: 0.7,
          },
        });

        // Send the new message
        const result = await chat.sendMessage(input.message);
        const response = await result.response;
        const aiResponse = response.text();

        return {
          response: aiResponse || "I'm sorry, I couldn't generate a response.",
        };
      } catch (error: any) {
        console.error('Error calling Gemini API:', error);
        console.error('Error details:', error?.message || error);

        // Provide more specific error messages
        if (error?.message?.includes('API_KEY_INVALID')) {
          throw new Error('Invalid Gemini API key. Please check your GEMINI_API_KEY in .env file.');
        } else if (error?.message?.includes('RATE_LIMIT_EXCEEDED')) {
          throw new Error('Gemini API rate limit exceeded. Please try again in a moment.');
        } else if (error?.message?.includes('QUOTA_EXCEEDED')) {
          throw new Error('Gemini API quota exceeded. Please check your usage at https://makersuite.google.com');
        }

        throw new Error(`Failed to generate AI response: ${error?.message || 'Unknown error'}`);
      }
    }),
});
