import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import { db } from '@/db';
import { users } from '@/db/schema';
import { eq } from 'drizzle-orm';

export const auth = async () => {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;

    if (!token) {
      return null;
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { id: number; email: string };

    return {
      id: decoded.id,
      email: decoded.email,
    };
  } catch (error) {
    return null;
  }
};

export const getUser = async (id: number) => {
  return await db.select().from(users).where(eq(users.id, id)).limit(1);
};
