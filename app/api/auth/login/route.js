import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { dbConnect } from "../../../../lib/db";
import User from "../../../../models/User";
import { signJwt, setAuthCookie } from "../../../../lib/auth";

export async function POST(req) {
  await dbConnect();
  const { email, password } = await req.json();

  const user = await User.findOne({ email });
  if (!user) return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });   

  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });

  const token = signJwt({ id: user._id, role: user.role });
  setAuthCookie(token);

  return NextResponse.json({ user: { id: user._id, email: user.email, role: user.role, name: user.name } });
}
