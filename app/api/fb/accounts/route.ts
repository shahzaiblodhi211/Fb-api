import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "../../../../lib/db";
import { getUserFromRequest, requireRole } from "../../../../lib/auth";
import FbConnection from "../../../../models/FbConnection";
import { fetchAdAccounts, fetchSpendRange } from "../../../../lib/fb";

export async function GET(req: NextRequest) {
  await dbConnect();
  const me = await getUserFromRequest(req);
  if (!me) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const clientId = searchParams.get("clientId") || String(me._id);
  // Allow superadmin to read any client
  if (String(clientId) !== String(me._id) && !requireRole(me, ["superadmin"])) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const since = searchParams.get("since"); // yyyy-mm-dd
  const until = searchParams.get("until"); // yyyy-mm-dd
  const rangeMode = !!(since && until);

  const conn = await FbConnection.findOne({ user: clientId });
  if (!conn) return NextResponse.json({ data: [], error: "No Facebook connected" }, { status: 200 });

  // refresh accounts if not cached
  let accountsRes = await fetchAdAccounts(conn.accessToken);
  if (accountsRes.error) {
    return NextResponse.json({ error: accountsRes.error.message || "fb_error" }, { status: 400 });
  }
  const accounts = accountsRes.data || [];

  if (!rangeMode) {
    // lifetime: use amount_spent from account (cents)
    const hydrated = accounts.map((a: any) => ({
      id: a.id,
      name: a.name,
      account_status: a.account_status,
      balance: a.balance ?? 0,
      spent: a.amount_spent ? Number(a.amount_spent) / 100 : 0
    }));
    return NextResponse.json({ data: hydrated });
  }

  // date range: sum spend from insights
  const hydrated = await Promise.all(accounts.map(async (a: any) => {
    try {
      const ins = await fetchSpendRange(a.id, since!, until!, conn.accessToken);
      const rows = Array.isArray(ins.data) ? ins.data : [];
      const spend = rows.reduce((s, r) => s + (parseFloat(r.spend) || 0), 0);
      return {
        id: a.id, name: a.name, account_status: a.account_status, balance: a.balance ?? 0, spent: spend
      };
    } catch {
      return { id: a.id, name: a.name, account_status: a.account_status, balance: a.balance ?? 0, spent: 0 };
    }
  }));

  return NextResponse.json({ data: hydrated });
}
