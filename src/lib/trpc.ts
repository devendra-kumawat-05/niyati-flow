import { createTRPCReact } from "@trpc/react-query";
import type { AppRouter } from "@/server/_router";

// Create the tRPC client
export const trpc = createTRPCReact<AppRouter>();

// Export the API client as default for backward compatibility
export const api = trpc;

// Export types
export type { AppRouter } from "@/server/_router";

// Export the tRPC client and types
export * from "@trpc/react-query";
