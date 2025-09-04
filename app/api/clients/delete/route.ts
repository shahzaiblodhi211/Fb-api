// app/api/clients/delete/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getUserFromRequest } from "../../../../lib/auth";
import User from "../../../../models/User";
import "../../../../lib/db";

export async function DELETE(req: NextRequest) {
  const user = await getUserFromRequest(req);
  if (!user || user.role !== "superadmin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Missing client ID" }, { status: 400 });

  await User.findByIdAndDelete(id);
  return NextResponse.json({ success: true });
}
