import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import { getUserFromRequest, requireRole } from "@/lib/auth";
import ClientAdAccounts from "../../../../models/ClientAdAccounts"; // new model

export async function POST(req: NextRequest) {
  await dbConnect();
  const me = await getUserFromRequest(req);
  if (!me) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { clientId, adAccountIds } = await req.json();
  if (!clientId || !Array.isArray(adAccountIds)) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  // only superadmin can set selections for clients
  if (String(clientId) !== String(me._id) && !requireRole(me, ["superadmin"])) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await ClientAdAccounts.findOneAndUpdate(
    { clientId },
    { adAccountIds },
    { upsert: true, new: true }
  );

  return NextResponse.json({ success: true });
}
