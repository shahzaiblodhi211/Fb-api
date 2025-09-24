"use client";
import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Facebook, LogOut, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import DateRangePopover from "@/components/DateRangePopover";

// Define the structure of a row in the ad accounts table

type Row = {
  id: string;
  name: string;
  account_status: any;
  balance: number;
  spent: number;
  remaining_limit: number | null;
};

export default function ClientDashboard() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const clientId = params.id;

  const [me, setMe] = useState<any>(null);
  const [rows, setRows] = useState<Row[]>([]);
  const [businesses, setBusinesses] = useState<any[]>([]);
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);
  const [since, setSince] = useState("");
  const [until, setUntil] = useState("");

  // Fetch auth user
  useEffect(() => {
    (async () => {
      const d = await fetch("/api/auth/me").then((r) => r.json());
      if (!d.user) {
        router.replace("/");
        return;
      }
      if (d.user.role === "client" && String(d.user.id) !== String(clientId)) {
        router.replace(`/client/${d.user.id}/dashboard`);
        return;
      }
      setMe(d.user);
    })();
  }, [clientId, router]);

  const mode = useMemo(
    () => (since && until ? "range" : "lifetime"),
    [since, until]
  );

  // Load ad accounts
  async function load() {
    setErr("");
    setLoading(true);
    try {
      const qs = new URLSearchParams({ clientId });
      if (mode === "range") {
        qs.set("since", since);
        qs.set("until", until);
      }
      const res = await fetch(`/api/fb/accounts?${qs.toString()}`);
      const d = await res.json();
      if (!res.ok) throw new Error(d.error || "Failed");
      setRows(d.data || []);
    } catch (e: any) {
      setErr(e.message);
      setRows([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, [mode]);

  // Fetch clients list
  const [clients, setClients] = useState<any[]>([]);
  const fetchClients = async () => {
    try {
      const res = await fetch("/api/clients/list");
      const data = await res.json();
      if (!data.clients) return;
      const uniqueClients = Array.from(
        new Map(data.clients.map((c: any) => [c.id, c])).values()
      );
      setClients(uniqueClients);
    } catch (err) {
      console.error(err);
    }
  };
  useEffect(() => {
    fetchClients();
  }, []);

  // Fetch connected businesses
  const fetchBusinesses = async () => {
    try {
      const res = await fetch(`/api/fb/businesses?clientId=${clientId}`);
      const data = await res.json();
      if (res.ok) {
        setBusinesses(data.data || []);
      }
    } catch (err) {
      console.error("Error fetching businesses", err);
    }
  };
  useEffect(() => {
    if (me) fetchBusinesses();
  }, [me]);
  // 🔑 run load() every time since/until changes
  useEffect(() => {
    load();
  }, [since, until]);

  const connect = async (id: string) => {
    const client = clients.find((c) => c.id === id);
    if (!client) return;
    if (client.fbConnected) {
      alert("Client already connected to FB. You can reconnect if needed.");
    }
    const res = await fetch(`/api/fb/start?clientId=${id}`);
    const d = await res.json();
    if (d.url) window.location.href = d.url;
  };

  const handleLogout = async () => {
    try {
      const res = await fetch("/api/auth/logout", { method: "POST" });
      const data = await res.json();
      if (data.ok) {
        window.location.href = "/";
      } else {
        console.error("Logout failed:", data.message);
      }
    } catch (err) {
      console.error("Error logging out:", err);
    }
  };

  const client = clients.find((c) => c.id === clientId);

  return (
    <main className="p-6 md:p-10 min-h-screen bg-gray-50">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">
            Ad Account Reporting
          </h1>
          <p className="text-gray-500 mt-1">
            Client ID: <span className="font-mono">{clientId}</span>
          </p>
        </div>
        <div className="flex flex-wrap gap-3 mt-4 md:mt-0">
          {client && (
            <Button
              key={client.id}
              size="sm"
              variant="outline"
              className={
                client.fbConnected
                  ? "border-blue-300 text-white bg-gradient-to-r from-blue-400 to-blue-600"
                  : "border-blue-300 text-blue-700 hover:text-white hover:bg-gradient-to-r hover:from-blue-400 hover:to-blue-600"
              }
              onClick={() => connect(client.id)}
            >
              <Facebook className="w-4 h-4 mr-1" />
              {client.fbConnected ? "Connected" : "Connect"}
            </Button>
          )}
          <Button
            onClick={handleLogout}
            size="sm"
            variant="outline"
            className="border-red-300 text-red-700 hover:text-white hover:bg-gradient-to-r hover:from-red-400 hover:to-red-600"
          >
            <LogOut size={16} /> Logout
          </Button>
        </div>
      </div>

      {/* Businesses */}
      {businesses.length > 0 && (
        <div className="bg-white rounded-2xl shadow p-5 mb-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-3 flex items-center gap-2">
            <Building2 className="w-5 h-5 text-indigo-600" /> Connected
            Businesses
          </h2>
          <ul className="space-y-2">
            {businesses.map((b) => (
              <li
                key={b.id}
                className="p-3 rounded-xl border border-gray-200 bg-gray-50 hover:bg-gray-100 transition"
              >
                <span className="font-medium text-gray-800">{b.name}</span>{" "}
                <span className="text-sm text-gray-500">({b.id})</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-2xl shadow p-5 mb-6">
        <div className="flex flex-wrap items-center gap-4">
          <DateRangePopover
            onChange={(since, until, count) => {
              setSince(since);
              setUntil(until);
            }}
            onReset={() => {
              setSince("");
              setUntil("");
            }}
          />

          <button
            onClick={load}
            className="rounded-xl border border-gray-300 px-4 py-2 text-sm font-medium shadow-sm transition hover:bg-gray-100"
          >
            Refresh
          </button>
        </div>
      </div>

      {/* Errors */}
      {err && <div className="text-red-600 mb-3 font-medium">{err}</div>}

      {/* Accounts table */}
      <div className="overflow-auto bg-white rounded-2xl shadow p-4">
        {loading ? (
          <p className="text-center text-gray-500">Loading…</p>
        ) : (
          <table className="min-w-full border-collapse">
            <thead>
              <tr className="bg-gradient-to-r from-blue-100 via-purple-100 to-indigo-100 text-gray-700">
                <th className="p-3 text-left">Name</th>
                <th className="p-3 text-left">ID</th>
                <th className="p-3 text-left">Status</th>
                <th className="p-3 text-left">Amount Spent</th>
                <th className="p-3 text-left">Remaining Amount</th>
              </tr>
            </thead>

            <tbody>
              {rows.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-4 text-center text-gray-500">
                    No data
                  </td>
                </tr>
              )}

              {rows.map((r) => (
                <tr
                  key={r.id}
                  className="border-b border-gray-200 hover:bg-gray-50 transition"
                >
                  <td className="p-3 font-medium text-gray-800">{r.name}</td>
                  <td className="p-3 font-mono text-gray-600">{r.id}</td>
                  <td className="p-3">
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-semibold ${r.account_status === 1 || r.account_status === 101
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                        }`}
                    >
                      {r.account_status === 1 || r.account_status === 101
                        ? "Active"
                        : "Disabled"}
                    </span>
                  </td>
                  <td className="p-3">
                    {r.spent == null ? "—" : `$${r.spent.toFixed(2)}`}
                  </td>
                  <td
                    className={`p-3 font-semibold ${Number(r.remaining_limit) < 300
                      ? "text-red-600"
                      : "text-green-600"
                      }`}
                  >
                    ${Number(r.remaining_limit ?? 0).toFixed(2)}
                  </td>
                </tr>
              ))}

              {/* ✅ Summary Row */}
              {rows.length > 0 && (
                <tr className="bg-gray-100 font-semibold">
                  {/* ✅ Totals label now in the first column */}
                  <td className="p-3 text-left">Totals:</td>

                  {/* Empty cells to keep the layout aligned */}
                  <td>-</td>
                  <td>-</td>

                  {/* Spent total */}
                  <td className="p-3 text-blue-700">
                    $
                    {rows
                      .reduce((sum, r) => sum + (r.spent ?? 0), 0)
                      .toFixed(2)}
                  </td>

                  {/* Remaining total */}
                  <td className="p-3 text-blue-700">
                    $
                    {rows
                      .reduce((sum, r) => sum + Number(r.remaining_limit ?? 0), 0)
                      .toFixed(2)}
                  </td>
                </tr>
              )}

            </tbody>
          </table>

        )}
      </div>
    </main>
  );
}
