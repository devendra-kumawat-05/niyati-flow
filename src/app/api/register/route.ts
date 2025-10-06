import { NextResponse } from "next/server";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function POST(req: Request) {
  const { name, email, password } = await req.json();

  if (!name || !email || !password) {
    return NextResponse.json(
      { message: "All fields are required" },
      { status: 400 }
    );
  }

  // Check if email already exists
  const existingUser = db
    .select()
    .from(users)
    .where(eq(users.email, email))
    .get();
  if (existingUser) {
    return NextResponse.json(
      { message: "Email already registered" },
      { status: 409 }
    );
  }

  // Insert new user
  db.insert(users).values({ name, email, password }).run();

  return NextResponse.json(
    { message: "User registered successfully" },
    { status: 201 }
  );
}
