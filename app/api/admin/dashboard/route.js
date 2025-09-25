import { NextResponse } from "next/server";
import { dbConnect } from "../../../../lib/db";
import { getUserFromRequest, requireRole } from "../../../../lib/auth";
import User from "../../../../models/User";
import FbConnection from "../../../../models/FbConnection";
import {
  fetchAdAccounts,
  fetchCampaigns,
  fetchSpendRange,
} from "../../../../lib/fb";

export async function GET(req) {
  await dbConnect();

  const user = await getUserFromRequest(req);
  if (!user || !requireRole(user, ["superadmin"])) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // ----- Date ranges -----
  const today = new Date();
  const todayISO = today.toISOString().slice(0, 10);
  const allTimeRange = { since: "2024-01-01", until: todayISO };
  const weekRange = { since: "2025-09-01", until: "2025-09-07" }; // adjust if needed

  // ----- Fetch clients -----
  const clients = await User.find({ role: "client" })
    .select("_id name email")
    .lean();

  const recentClients = clients.map((c) => ({
    id: c._id.toString(),
    name: c.name,
    email: c.email,
    status: "active",
  }));

  const fbConnections = await FbConnection.find({
    user: { $in: clients.map((c) => c._id) },
  }).lean();

  let adAccounts = 0;
  let totalSpend = 0;
  let activeCampaigns = 0;
  const reportData = [];

  await Promise.all(
    fbConnections.map(async (conn) => {
      try {
        const accountsRes = await fetchAdAccounts(conn.accessToken);
        const accounts = accountsRes.data || [];
        adAccounts += accounts.length;

        await Promise.all(
          accounts.map(async (acc) => {
            try {
              // Active campaigns
              const campaignsRes = await fetchCampaigns(acc.id, conn.accessToken);
              const campaigns = campaignsRes.data || [];
              activeCampaigns += campaigns.filter((c) => c.status === "ACTIVE").length;

              // ✅ Sum spend from 2024-01-01 → today
              const lifetime = await fetchSpendRange(
                acc.id,
                allTimeRange.since,
                allTimeRange.until,
                conn.accessToken
              );
              const lifetimeRows = Array.isArray(lifetime.data) ? lifetime.data : [];
              lifetimeRows.forEach((r) => {
                totalSpend += parseFloat(r.spend) || 0;
              });

              // Weekly spend for chart
              const week = await fetchSpendRange(
                acc.id,
                weekRange.since,
                weekRange.until,
                conn.accessToken,
                "1"
              );
              const weekRows = Array.isArray(week.data) ? week.data : [];
              weekRows.forEach((r) => {
                const dayLabel = new Date(r.date_start)
                  .toLocaleDateString("en-US", { weekday: "short" })
                  .slice(0, 3);
                const spend = parseFloat(r.spend) || 0;
                const existing = reportData.find((x) => x.month === dayLabel);
                if (existing) existing.spend += spend;
                else reportData.push({ month: dayLabel, spend });
              });
            } catch (err) {
              console.warn("[Account Error]", acc.id, err.message);
            }
          })
        );
      } catch (err) {
        console.warn("[Connection Error]", conn._id, err.message);
      }
    })
  );

  // Sort weekly report
  const order = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  reportData.sort((a, b) => order.indexOf(a.month) - order.indexOf(b.month));

  // ✅ Round total spend to two decimals
  const roundedSpend = Number(totalSpend.toFixed(2));

  return NextResponse.json({
    stats: {
      clients: clients.length,
      adAccounts,
      activeCampaigns,
      spend: roundedSpend, // e.g. 36122.91
    },
    recentClients,
    reportData,
  });
}
