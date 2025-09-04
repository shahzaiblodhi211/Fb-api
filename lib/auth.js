import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import { NextRequest } from "next/server";
import { dbConnect } from "./db";
import User, { IUser } from "../models/User";

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) throw new Error("JWT_SECRET missing");

export function signJwt(payload, expiresIn = "7d") {
  return jwt.sign(payload, JWT_SECRET, { expiresIn });
}

export async function getUserFromRequest(req) {
  const cookieStore = cookies();
  const token = cookieStore.get("token")?.value || req.headers.get("authorization")?.replace("Bearer ", "");
  if (!token) return null;
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    await dbConnect();
    const user = await User.findById(decoded.id);
    return user || null;
  } catch {
    return null;
  }
}

export function setAuthCookie(token) {
  // set httpOnly cookie in route handler
  cookies().set("token", token, {
    httpOnly: true, sameSite: "lax", secure: false, path: "/", maxAge: 60 * 60 * 24 * 7
  });
}

export function clearAuthCookie() {
  cookies().set("token", "", { httpOnly: true, maxAge: 0, path: "/" });
}

export function requireRole(user, roles) {
  if (!user) return false;
  return roles.includes(user.role);
}
