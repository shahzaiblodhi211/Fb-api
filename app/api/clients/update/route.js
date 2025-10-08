import { NextRequest, NextResponse } from "next/server";
import { getUserFromRequest } from "../../../../lib/auth";
import User from "../../../../models/User";
import "../../../../lib/db";

export async function PUT(req) {
  const user = await getUserFromRequest(req);

  // ✅ Allow both superadmin and admin
  if (!user || (user.role !== "superadmin" && user.role !== "admin")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id, name, email, password } = await req.json();
  if (!id) {
    return NextResponse.json({ error: "Missing client ID" }, { status: 400 });
  }

  // ✅ Only include provided fields
  const updateData = {};
  if (name) updateData.name = name;
  if (email) updateData.email = email;
  if (password) {
    const bcrypt = await import("bcryptjs");
    updateData.passwordHash = await bcrypt.hash(password, 10);
  }

  const updated = await User.findByIdAndUpdate(id, updateData, {
    new: true,
  }).select("_id email name");

  if (!updated) {
    return NextResponse.json({ error: "Client not found" }, { status: 404 });
  }

  return NextResponse.json({
    success: true,
    client: {
      id: updated._id.toString(),
      email: updated.email,
      name: updated.name,
    },
  });
}
