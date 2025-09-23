import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import { dbConnect } from "./db";
import User from "../models/User";

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) throw new Error("JWT_SECRET missing");

export function signJwt(payload, expiresIn = "7d") {
  return jwt.sign(payload, JWT_SECRET, { expiresIn });
}

export async function getUserFromRequest(req) {
  // ✅ cookies() is sync
  const cookieStore = cookies();

  const token =
    cookieStore.get("token")?.value ||
    req.headers.get("authorization")?.replace("Bearer ", "");

  if (!token) return null;

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    await dbConnect();
    const user = await User.findById(decoded.id);
    return user || null;
  } catch (err) {
    console.error("[Auth] Invalid token:", err);
    return null;
  }
}

// ⚠️ Must be called inside a route handler, not from random helpers
export function setAuthCookie(token) {
  const cookieStore = cookies();
  cookieStore.set("token", token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 7 days
  });
}

export function clearAuthCookie() {
  const cookieStore = cookies();
  cookieStore.set("token", "", {
    httpOnly: true,
    maxAge: 0,
    path: "/",
  });
}

export function requireRole(user, roles) {
  if (!user) return false;
  return roles.includes(user.role);
}
