import {NextRequest, NextResponse } from "next/server";
import { dbConnect } from "../../../../lib/db";
import { getUserFromRequest, requireRole } from "../../../../lib/auth";
import User from "../../../../models/User";
import FbConnection from "../../../../models/FbConnection";
import {
  fetchAdAccounts,
  fetchCampaigns,
  fetchSpendRange,
} from "../../../../lib/fb";

export async function GET(req: NextRequest) {
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
  const reportData: { month: string; spend: number }[] = [];

  // Current week (example: Sept 1–7, 2025 → adjust dynamically if needed)
  const days = [
    { label: "Mon", since: "2025-09-01", until: "2025-09-01" },
    { label: "Tue", since: "2025-09-02", until: "2025-09-02" },
    { label: "Wed", since: "2025-09-03", until: "2025-09-03" },
    { label: "Thu", since: "2025-09-04", until: "2025-09-04" },
    { label: "Fri", since: "2025-09-05", until: "2025-09-05" },
    { label: "Sat", since: "2025-09-06", until: "2025-09-06" },
    { label: "Sun", since: "2025-09-07", until: "2025-09-07" },
  ];

  for (const conn of fbConnections) {
    try {
      const accountsRes = await fetchAdAccounts(conn.accessToken);
      const accounts = accountsRes.data || [];
      adAccounts += accounts.length;

      // Fetch campaigns for each account to calculate active campaigns
      for (const acc of accounts) {
        try {
          const campaignsRes = await fetchCampaigns(acc.id, conn.accessToken);
          const campaigns = campaignsRes.data || [];
          activeCampaigns += campaigns.filter(
            (c) => c.status === "ACTIVE"
          ).length;

          // Sum lifetime spend
          totalSpend += acc.amount_spent ? Number(acc.amount_spent) / 100 : 0;

          // Weekly report (Mon–Sun)
          for (const day of days) {
            const insights = await fetchSpendRange(
              acc.id,
              day.since,
              day.until,
              conn.accessToken
            );
            const rows = Array.isArray(insights.data) ? insights.data : [];
            const daySpend = rows.reduce(
              (sum, r) => sum + (parseFloat(r.spend) || 0),
              0
            );

            const existing = reportData.find((r) => r.month === day.label);
            if (existing) existing.spend += daySpend;
            else reportData.push({ month: day.label, spend: daySpend });
            console.log(reportData) 
          }
        } catch {
          continue; // ignore errors per account
        }
      }
    } catch {
      continue; // ignore errors per connection
    }
  }

  const stats = {
    clients: clients.length,
    adAccounts,
    activeCampaigns,
    spend: totalSpend,
  };

  return NextResponse.json({ stats, recentClients, reportData });
}
