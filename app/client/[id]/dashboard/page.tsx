"use client";
import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { Facebook, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";

type Row = { id: string; name: string; account_status: any; balance: number; spent: number };

export default function ClientDashboard() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const clientId = params.id;
  const [me, setMe] = useState<any>(null);
  const [rows, setRows] = useState<Row[]>([]);
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);
  const [since, setSince] = useState("");
  const [until, setUntil] = useState("");

  useEffect(() => {
    (async () => {
      const d = await fetch("/api/auth/me").then(r => r.json());
      if (!d.user) { router.replace("/"); return; }
      if (d.user.role === "client" && String(d.user.id) !== String(clientId)) {
        router.replace(`/client/${d.user.id}/dashboard`); return;
      }
      setMe(d.user);
    })();
  }, [clientId, router]);

  const mode = useMemo(() => (since && until ? "range" : "lifetime"), [since, until]);

  async function load() {
    setErr(""); setLoading(true);
    try {
      const qs = new URLSearchParams({ clientId });
      if (mode === "range") { qs.set("since", since); qs.set("until", until); }
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

  useEffect(() => { load(); }, [mode]);

  const [clients, setClients] = useState([]);

  // Fetch clients safely
  const fetchClients = async () => {
    try {
      const res = await fetch("/api/clients/list");
      const data = await res.json();

      if (!data.clients) return;

      // Remove duplicates by ID
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


  const connect = async (id) => {
    const client = clients.find((c) => c.id === id);
    if (!client) return;

    // If already connected, maybe allow re-auth or show message
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
        // Redirect to login page
        window.location.href = "/";
      } else {
        console.error("Logout failed:", data.message);
      }
    } catch (err) {
      console.error("Error logging out:", err);
    }
  };
  const client = clients.find(c => c.id === clientId);

  return (
    <main className="p-6 md:p-10 min-h-screen bg-gray-50">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div className="mb-4 md:mb-0">
          <h1 className="text-3xl font-bold text-gray-800">Ad Account Reporting</h1>
          <p className="text-gray-500 mt-1">Client ID: <span className="font-mono">{clientId}</span></p>
        </div>
        <div className="flex flex-wrap gap-3">
          {client ?
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
            : ''}
          <Button
            onClick={handleLogout}
            size="sm"
            variant="outline"
            className="border-red-300 text-red-700 cursor-pointer hover:text-white hover:bg-gradient-to-r hover:from-red-400 hover:to-red-600 transition"
          >
            <LogOut size={16} /> Logout
          </Button>
        </div>


      </div>

      <div className="bg-white rounded-2xl shadow p-5 mb-6">
        <div className="flex flex-wrap items-end gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Since</label>
            <input type="date" className="border px-3 py-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400" value={since} onChange={e => setSince(e.target.value)} max={until || undefined} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Until</label>
            <input type="date" className="border px-3 py-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400" value={until} onChange={e => setUntil(e.target.value)} min={since || undefined} />
          </div>
          <button onClick={() => { setSince(""); setUntil(""); }} className="px-4 py-2 rounded-xl border border-gray-300 hover:bg-gray-100 transition">
            Reset to Lifetime
          </button>
          <button onClick={load} className="px-4 py-2 rounded-xl border border-gray-300 hover:bg-gray-100 transition">
            Refresh
          </button>
        </div>
      </div>

      {err && <div className="text-red-600 mb-3 font-medium">{err}</div>}

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
                <th className="p-3 text-left">Balance</th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 && <tr><td colSpan={5} className="p-4 text-center text-gray-500">No data</td></tr>}
              {rows.map(r => (
                <tr key={r.id} className="border-b border-gray-200 hover:bg-gray-50 transition">
                  <td className="p-3 font-medium text-gray-800">{r.name}</td>
                  <td className="p-3 font-mono text-gray-600">{r.id}</td>
                  <td className="p-3">
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-semibold ${r.account_status === 1
                        ? "bg-green-100 text-green-700"
                        : r.account_status === 101
                          ? "bg-yellow-100 text-yellow-700"
                          : "text-gray-500"
                        }`}
                    >
                      {r.account_status === 1
                        ? "active"
                        : r.account_status === 101
                          ? "pending"
                          : "Unknown"}
                    </span>
                  </td>
                  <td className="p-3">{r.spent == null ? "—" : `$${r.spent.toFixed(2)}`}</td>
                  <td
                    className={`p-3 font-semibold ${Number(r.balance) < 300 ? "text-red-600" : "text-green-600"
                      }`}
                  >
                    ${Number(r.balance ?? 0).toFixed(2)}
                  </td>

                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </main>
  );
}
