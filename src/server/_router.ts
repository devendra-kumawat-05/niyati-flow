import { router } from "./trpc";
import { authRouter } from "./routers/auth";
import { chatRouter } from "./routers/chat";

export const appRouter = router({
  auth: authRouter,
  chat: chatRouter,
});

export type AppRouter = typeof appRouter;
