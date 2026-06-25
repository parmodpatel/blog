import "server-only";

import { cookies } from "next/headers";
import jwt, { type JwtPayload } from "jsonwebtoken";
import { connectMongoDB } from "@/lib/mongodb";
import User from "@/models/User";

export type AuthUser = {
  id: string;
  name: string;
  email: string;
};

const COOKIE_NAME = "blog_auth_token";

function getJwtSecret() {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new Error("JWT_SECRET is not set");
  }

  return secret;
}

export function signAuthToken(userId: string) {
  return jwt.sign({ userId }, getJwtSecret(), { expiresIn: "7d" });
}

export async function setAuthCookie(userId: string) {
  const cookieStore = await cookies();

  cookieStore.set(COOKIE_NAME, signAuthToken(userId), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 7,
    path: "/",
  });
}

export async function clearAuthCookie() {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}

export async function getCurrentUser(): Promise<AuthUser | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;

  if (!token) {
    return null;
  }

  try {
    const payload = jwt.verify(token, getJwtSecret()) as JwtPayload & {
      userId?: string;
    };

    if (!payload.userId) {
      return null;
    }

    await connectMongoDB();
    const user = await User.findById(payload.userId).select("name email").lean();

    if (!user) {
      return null;
    }

    return {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
    };
  } catch {
    return null;
  }
}
