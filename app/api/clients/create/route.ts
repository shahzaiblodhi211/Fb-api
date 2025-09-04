import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { dbConnect } from "../../../../lib/db";
import User from "../../../../models/User";
import { getUserFromRequest, requireRole } from "../../../../lib/auth";

export async function POST(req: NextRequest) {
  await dbConnect();
  const me = await getUserFromRequest(req);
  if (!requireRole(me, ["superadmin"])) return NextResponse.json({ error: "Forbidden" }, { status: 403 });3

  const { email, name, password } = await req.json();
  const hash = await bcrypt.hash(password, 10);

  const created = await User.create({ email, name, role: "client", passwordHash: hash });
  return NextResponse.json({ client: { id: created._id, email: created.email, name: created.name } });
}
