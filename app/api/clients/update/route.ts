// app/api/clients/update/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getUserFromRequest } from "../../../../lib/auth";
import User from "../../../../models/User";
import "../../../../lib/db";

export async function PUT(req: NextRequest) {
  const user = await getUserFromRequest(req);
  if (!user || user.role !== "superadmin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id, name, email, password } = await req.json();
  if (!id) return NextResponse.json({ error: "Missing client ID" }, { status: 400 });

  const updateData: any = {};
  if (name) updateData.name = name;
  if (email) updateData.email = email;
  if (password) {
    const bcrypt = await import("bcryptjs");
    updateData.passwordHash = await bcrypt.hash(password, 10);
  }

  const updated = await User.findByIdAndUpdate(id, updateData, { new: true }).select("_id email name");

  return NextResponse.json({
    client: {
      id: updated?._id.toString(),
      email: updated?.email,
      name: updated?.name,
    },
  });
}
