import { router, protectedProcedure } from '@/server/trpc';
import { z } from 'zod';

/**
 * Mock AI Router - Use this as a fallback when OpenAI API is unavailable
 * This provides simple pattern-based responses without requiring API credits
 */
export const aiMockRouter = router({
  generateResponse: protectedProcedure
    .input(
      z.object({
        conversationId: z.number(),
        message: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      const userMessage = input.message.toLowerCase();
      
      // Simple pattern matching for mock responses
      let response = '';
      
      if (userMessage.includes('hello') || userMessage.includes('hi')) {
        response = "Hello! I'm a demo AI assistant. How can I help you today?";
      } else if (userMessage.includes('how are you')) {
        response = "I'm doing well, thank you for asking! I'm here to assist you.";
      } else if (userMessage.includes('what') && userMessage.includes('name')) {
        response = "I'm Niyati Flow AI Assistant, a demo chatbot.";
      } else if (userMessage.includes('help')) {
        response = "I'm here to help! You can ask me questions or have a conversation. Note: I'm currently running in demo mode with limited responses.";
      } else if (userMessage.includes('thank')) {
        response = "You're welcome! Is there anything else I can help you with?";
      } else if (userMessage.includes('bye') || userMessage.includes('goodbye')) {
        response = "Goodbye! Feel free to come back anytime you need assistance.";
      } else {
        // Generic response for unmatched patterns
        const responses = [
          "That's interesting! Tell me more about that.",
          "I understand. Could you elaborate on that?",
          "Thanks for sharing that with me. What else would you like to discuss?",
          "I see. How can I assist you further with this?",
          "That's a good point. What are your thoughts on this?",
        ];
        response = responses[Math.floor(Math.random() * responses.length)];
      }
      
      // Add a note about demo mode
      response += "\n\n_Note: This is a demo response. To enable full AI capabilities, get a FREE Gemini API key at https://makersuite.google.com/app/apikey_";
      
      return {
        response,
      };
    }),
});
