import { z } from "zod";
import { router, publicProcedure, protectedProcedure } from "../trpc";
import { auth } from "../auth";
import { eq, and } from "drizzle-orm";
import { users } from "@/db/schema";
import { db } from "@/db";
import * as bcrypt from "bcryptjs";

// Define the user type for the response
type User = {
  id: number;
  name: string;
  email: string;
};

// Create the router with proper typing
export const authRouter = router({
  getUser: protectedProcedure.query(async ({ ctx }): Promise<User> => {
    try {
      const [user] = await db
        .select({
          id: users.id,
          name: users.name,
          email: users.email,
        })
        .from(users)
        .where(eq(users.id, ctx.user.id))
        .limit(1);

      if (!user) {
        throw new Error("User not found");
      }

      return user;
    } catch (error) {
      console.error("Error fetching user:", error);
      throw new Error("Failed to fetch user");
    }
  }),

  changePassword: protectedProcedure
    .input(
      z.object({
        currentPassword: z.string().min(8, { message: "Current password is required" }),
        newPassword: z.string().min(8, { message: "New password must be at least 8 characters" }),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { currentPassword, newPassword } = input;

      try {
        // Get the user with their password hash
        const [user] = await db
          .select({
            id: users.id,
            password: users.password,
          })
          .from(users)
          .where(eq(users.id, ctx.user.id))
          .limit(1);

        if (!user || !user.password) {
          throw new Error("User not found or password not set");
        }

        // Verify current password
        const isValidPassword = await bcrypt.compare(currentPassword, user.password);
        if (!isValidPassword) {
          throw new Error("Current password is incorrect");
        }

        // Hash the new password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        // Update the user's password
        await db
          .update(users)
          .set({ password: hashedPassword })
          .where(eq(users.id, ctx.user.id));

        return { success: true, message: "Password updated successfully" };
      } catch (error) {
        console.error("Error changing password:", error);
        throw new Error(error instanceof Error ? error.message : "Failed to change password");
      }
    }),
});
