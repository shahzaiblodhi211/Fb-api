import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { dbConnect } from "../../../../lib/db";
import User from "../../../../models/User";
import { getUserFromRequest, requireRole } from "../../../../lib/auth";

export async function POST(req) {
  try {
    console.log("[POST /api/.../create-client] Incoming request");

    // connect DB
    await dbConnect();
    console.log("[DB] Connected");

    // auth check
    const me = await getUserFromRequest(req);
    console.log("[Auth] Current user:", me?._id, "role:", me?.role);

    if (!requireRole(me, ["superadmin"])) {
      console.warn("[Auth] Forbidden for user:", me?._id);
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // parse body
    const { email, name, password } = await req.json();
    console.log("[Body] email:", email, "name:", name);

    // hash password
    const hash = await bcrypt.hash(password, 10);
    console.log("[Hash] password hashed");

    // create user
    const created = await User.create({
      email,
      name,
      role: "client",
      passwordHash: hash,
    });
    console.log("[DB] User created:", created);

    return NextResponse.json({
      client: { id: created._id, email: created.email, name: created.name },
    });
  } catch (err) {
    console.error("[Error] Failed to create client:", err);
    return NextResponse.json(
      { error: "Failed to create client", details: err.message },
      { status: 500 }
    );
  }
}
