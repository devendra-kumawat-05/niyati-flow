import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { InferModel } from "drizzle-orm";

// Example: Users table
export const users = sqliteTable("users", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
});

// Optional: Types for TypeScript
export type User = InferModel<typeof users>;
export type NewUser = InferModel<typeof users, "insert">;
