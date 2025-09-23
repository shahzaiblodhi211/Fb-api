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

  // Fetch all clients
  const clients = await User.find({ role: "client" })
    .select("_id name email")
    .lean();
  const recentClients = clients.map((c) => ({
    id: c._id.toString(),
    name: c.name,
    email: c.email,
    status: "active", // optionally update from FB
  }));

  // Fetch FB connections for all clients
  const fbConnections = await FbConnection.find({
    user: { $in: clients.map((c) => c._id) },
  }).lean();

  let adAccounts = 0;
  let totalSpend = 0;
  let activeCampaigns = 0;

  // Initialize report data
  const reportData = [];

  // Current week (example: Sept 1–7, 2025 → dynamically adjust if needed)
  const weekRange = { since: "2025-09-01", until: "2025-09-07" };

  // Run per-connection tasks in parallel
  await Promise.all(
    fbConnections.map(async (conn) => {
      try {
        const accountsRes = await fetchAdAccounts(conn.accessToken);
        const accounts = accountsRes.data || [];
        adAccounts += accounts.length;

        await Promise.all(
          accounts.map(async (acc) => {
            try {
              // campaigns
              const campaignsRes = await fetchCampaigns(
                acc.id,
                conn.accessToken
              );
              const campaigns = campaignsRes.data || [];
              activeCampaigns += campaigns.filter(
                (c) => c.status === "ACTIVE"
              ).length;

              // lifetime spend
              totalSpend += acc.amount_spent
                ? Number(acc.amount_spent) / 100
                : 0;

              // weekly spend in one call
              const insights = await fetchSpendRange(
                acc.id,
                weekRange.since,
                weekRange.until,
                conn.accessToken,
                "1" // ⚡ daily breakdown
              );

              const rows = Array.isArray(insights.data) ? insights.data : [];
              rows.forEach((r) => {
                const date = r.date_start; // comes per day
                const dayLabel = new Date(date)
                  .toLocaleDateString("en-US", { weekday: "short" })
                  .slice(0, 3); // "Mon", "Tue", etc.

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

  // sort reportData by weekday order
  const order = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  reportData.sort(
    (a, b) => order.indexOf(a.month) - order.indexOf(b.month)
  );

  const stats = {
    clients: clients.length,
    adAccounts,
    activeCampaigns,
    spend: totalSpend,
  };

  return NextResponse.json({ stats, recentClients, reportData });
}
