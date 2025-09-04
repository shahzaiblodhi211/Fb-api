import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "../../../../lib/db";
import { getUserFromRequest, requireRole } from "../../../../lib/auth";
import Report from "../../../../models/Report";

export async function POST(req) {
  await dbConnect();
  const me = await getUserFromRequest(req);
  if (!me) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  // body: { clientId, dateFrom, dateTo, rows: [{ adAccountId, spend, raw? }, ...] }
  const { clientId, dateFrom, dateTo, rows } = body;

  if (String(clientId) !== String(me._id) && !requireRole(me, ["superadmin"])) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const ops = rows.map((r) => ({
    updateOne: {
      filter: { user: clientId, adAccountId: r.adAccountId, dateFrom, dateTo },
      update: { $set: { spend: r.spend, raw: r.raw ?? null } },
      upsert: true
    }
  }));

  if (ops.length) await Report.bulkWrite(ops);
  return NextResponse.json({ ok: true, upserted: ops.length });
}
