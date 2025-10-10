import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function POST() {
  try {
    // Clear the authentication cookie
    const response = NextResponse.json(
      { success: true },
      { status: 200 }
    );
    
    // Set the cookie to expire immediately
    response.cookies.set({
      name: 'token',
      value: '',
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 0 // Expire immediately
    });
    
    return response;
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to log out' },
      { status: 500 }
    );
  }
}
