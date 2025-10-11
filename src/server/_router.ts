import { router } from "./trpc";
import { authRouter } from "./routers/auth";
import { chatRouter } from "./routers/chat";
import { aiRouter } from "./routers/ai";

export const appRouter = router({
  auth: authRouter,
  chat: chatRouter,
  ai: aiRouter,
});

export type AppRouter = typeof appRouter;
