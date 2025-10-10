import { auth } from "@/server/auth";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const user = await auth();
    
    if (!user) {
      return NextResponse.json(
        { isAuthenticated: false },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { isAuthenticated: true, user },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
