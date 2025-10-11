import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { InferModel } from "drizzle-orm";

// Example: Users table
export const users = sqliteTable("users", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
});

// Chat conversations
export const conversations = sqliteTable("conversations", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  title: text("title").notNull(),
  createdAt: text("created_at").notNull().$defaultFn(() => new Date().toISOString()),
  updatedAt: text("updated_at").notNull().$defaultFn(() => new Date().toISOString()),
});

// Chat messages
export const messages = sqliteTable("messages", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  conversationId: integer("conversation_id").notNull().references(() => conversations.id, { onDelete: 'cascade' }),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  content: text("content").notNull(),
  role: text("role").notNull(), // 'user' or 'assistant'
  createdAt: text("created_at").notNull().$defaultFn(() => new Date().toISOString()),
});

// Optional: Types for TypeScript
export type User = InferModel<typeof users>;
export type NewUser = InferModel<typeof users, "insert">;

export type Conversation = InferModel<typeof conversations>;
export type NewConversation = InferModel<typeof conversations, "insert">;

export type Message = InferModel<typeof messages>;
export type NewMessage = InferModel<typeof messages, "insert">;
