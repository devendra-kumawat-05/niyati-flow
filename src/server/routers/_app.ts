import { router } from '../trpc';
import { chatRouter } from './chat';
import { aiRouter } from './ai';
import { aiMockRouter } from './ai-mock';
import { aiGeminiRouter } from './ai-gemini';
import { authRouter } from './auth';

// Determine which AI to use based on environment variables
const getAIRouter = () => {
  // Force mock AI if explicitly set
  if (process.env.USE_MOCK_AI === 'true') {
    return aiMockRouter;
  }
  
  // Use Gemini if API key is available (default)
  if (process.env.GEMINI_API_KEY) {
    return aiGeminiRouter;
  }
  
  // Use OpenAI if API key is available
  if (process.env.OPENAI_API_KEY) {
    return aiRouter;
  }
  
  // Fallback to mock AI
  return aiMockRouter;
};

export const appRouter = router({
  chat: chatRouter,
  ai: getAIRouter(),
  auth: authRouter,
});

export type AppRouter = typeof appRouter;
