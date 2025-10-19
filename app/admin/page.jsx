"use client";
import { useEffect, useState } from "react";
import { formatUSD } from "@/lib/formatCurrency";
import {
  BarChart3,
  Users,
  TrendingUp,
  DollarSign,
  UserPlus,
  CheckCircle2,
  Clock,
  LayoutDashboard,
  LogOut,
  Trash2,
  Edit2,
  Eye,
  Facebook,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  ResponsiveContainer,
  LineChart as RLineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";

// Skeleton Loader
function Skeleton({ className }) {
  return <div className={`animate-pulse rounded bg-gray-300/40 ${className}`} />;
}

export default function AdminDashboard() {
  // ===== Stats =====
  const [stats, setStats] = useState({
    adAccounts: 0,
    clients: 0,
    activeCampaigns: 0,
    spend: 0,
  });

  // ===== Clients =====
  const [recentClients, setRecentClients] = useState([]);
  const [clients, setClients] = useState([]);
  const [loadingClients, setLoadingClients] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showAddModal2, setShowAddModal2] = useState(false);
  const [editClient, setEditClient] = useState(null);
  const [editAdmin, setEditAdmin] = useState(null);

  // ===== Loading =====
  const [loading, setLoading] = useState(true);

  // ===== Accounts modal =====
  const [isAccountsModalOpen, setIsAccountsModalOpen] = useState(false);
  const [accountsLoading, setAccountsLoading] = useState(false);
  const [allAccounts, setAllAccounts] = useState([]);
  const [selectedClient, setSelectedClient] = useState(null);
  const [selectedAccounts, setSelectedAccounts] = useState({});

  // ===== Role & active tab =====
  const [userRole, setUserRole] = useState("");
  const [activeTab, setActiveTab] = useState("Dashboard");

  // ===== Form submission states =====
  const [submitting, setSubmitting] = useState(false);
  const [submitting2, setSubmitting2] = useState(false);
  const [submitting3, setSubmitting3] = useState(false);

  // ===== Report data =====
  const [reportData, setReportData] = useState([
    { month: "Mon", spend: 0 },
    { month: "Tue", spend: 180 },
    { month: "Wed", spend: 90 },
    { month: "Thu", spend: 0 },
    { month: "Fri", spend: 300 },
    { month: "Sat", spend: 220 },
    { month: "Sun", spend: 150 },
  ]);

  // ===== Load dashboard for admin/superadmin =====
  const loadAdminDashboard = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/dashboard", { credentials: "include" });
      if (res.ok) {
        const data = await res.json();
        setStats(data.stats || {});
        setRecentClients(data.recentClients || []);
        setReportData(data.reportData || reportData);
      }
    } catch (err) {
      console.error("Failed to load dashboard", err);
    } finally {
      setLoading(false);
    }
  };

  // ===== Load dashboard for client =====
  const loadClientDashboard = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/client/dashboard", { credentials: "include" });
      if (res.ok) {
        const data = await res.json();
        setStats(data.stats || {});
        setReportData(data.reportData || reportData);
      }
    } catch (err) {
      console.error("Failed to load client dashboard", err);
    } finally {
      setLoading(false);
    }
  };

  // ===== Load FB ad accounts =====
  const loadAccountsForClient = async (clientId) => {
    if (!["admin", "superadmin"].includes(userRole)) {
      console.warn("Unauthorized to view accounts");
      return;
    }

    setAccountsLoading(true);
    try {
      const res = await fetch(`/api/fb/accounts?clientId=${clientId}&all=true`);
      const data = await res.json();
      setAllAccounts(data.data || []);
      setSelectedClient(data.clientname || clientId);
      setIsAccountsModalOpen(true);
    } catch (err) {
      console.error("Failed to fetch accounts", err);
    } finally {
      setAccountsLoading(false);
    }
  };

  // ===== Fetch user role & initialize dashboard =====
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/auth/me");
        const data = await res.json();
        const role = data.user?.role || "";
        setUserRole(role);

        if (role === "client") {
          await loadClientDashboard();
        } else {
          await loadAdminDashboard();
        }

        if (["admin", "superadmin"].includes(role)) await fetchClients();
        if (role === "superadmin") await fetchAdmins(); // fetch admins list
      } catch (err) {
        console.error("Failed to get user role", err);
      }
    })();
  }, []);

  // ===== Persist selected accounts =====
  useEffect(() => {
    const stored = localStorage.getItem("selectedAccounts");
    if (stored) setSelectedAccounts(JSON.parse(stored));
  }, []);
  useEffect(() => {
    localStorage.setItem("selectedAccounts", JSON.stringify(selectedAccounts));
  }, [selectedAccounts]);

  // ===== Sidebar tabs by role =====
  const tabs = [
    { label: "Dashboard", icon: LayoutDashboard },
    { label: "Clients", icon: Users },
    { label: "Binance Dashboard", icon: LayoutDashboard },
    { label: "Add Client", icon: UserPlus },
  ];
  
  if (userRole === "superadmin") {
    tabs.push({ label: "Admins", icon: Users });
    tabs.push({ label: "Add Admin", icon: UserPlus });
  }

  // ===== Fetch clients =====
  const fetchClients = async () => {
    setLoadingClients(true);
    try {
      const res = await fetch("/api/clients/list");
      const data = await res.json();
      setClients(data.clients || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingClients(false);
    }
  };

  // ===== Fetch admins (superadmin only) =====
  const [admins, setAdmins] = useState([]);
  const [loadingAdmins, setLoadingAdmins] = useState(false);
  const fetchAdmins = async () => {
    setLoadingAdmins(true);
    try {
      const res = await fetch("/api/admins/create", {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });
      if (res.ok) {
        const data = await res.json();
        setAdmins(data.admins || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingAdmins(false);
    }
  };


  // ===== Delete client =====
  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this client?")) return;
    try {
      await fetch(`/api/clients/delete?id=${id}`, { method: "DELETE" });
      fetchClients();
    } catch (err) {
      console.error(err);
    }
  };
  const handleDeleteAdmin = async (id) => {
    if (!confirm("Are you sure you want to delete this Admin?")) return;
    try {
      const res = await fetch(`/api/admins/create`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });

      if (!res.ok) {
        const err = await res.json();
        alert(err.error || "Failed to delete admin");
        return;
      }

      await fetchAdmins(); // refresh list
    } catch (err) {
      console.error(err);
      alert("An error occurred while deleting admin");
    }
  };


  // ===== Add client =====
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting2(true);

    const form = e.currentTarget;
    const name = form.name.value;
    const email = form.email.value;
    const password = form.password.value;

    try {
      await fetch("/api/clients/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });
      form.reset();
      setActiveTab("Clients");
      fetchClients();
      alert("Client added successfully!");
    } catch (err) {
      console.error(err);
      alert("Failed to add client.");
    } finally {
      setSubmitting2(false);
    }
  };

  // ===== FB connect =====
  const connectForClient = async (clientId) => {
    const client = clients.find((c) => c.id === clientId);
    if (!client) return;
    if (client.fbConnected) {
      alert("Client already connected to FB. You can reconnect if needed.");
    }
    const res = await fetch(`/api/fb/start?clientId=${clientId}`);
    const d = await res.json();
    if (d.url) window.location.href = d.url;
  };

  // ===== Logout =====
  const handleLogout = async () => {
    try {
      const res = await fetch("/api/auth/logout", { method: "POST" });
      const data = await res.json();
      if (data.ok) window.location.href = "/";
      else console.error("Logout failed:", data.message);
    } catch (err) {
      console.error("Error logging out:", err);
    }
  };


  return (
    <div className="flex h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-indigo-50">
      {/* Sidebar */}
      <aside className="w-64 h-screen bg-gradient-to-br from-blue-800 via-purple-800 to-indigo-900 text-white p-6 flex flex-col justify-between shadow-2xl">
        <div>
          <h1 className="text-xl font-bold mb-8 flex items-center gap-2">
            <LayoutDashboard className="w-6 h-6" />
            Super Admin
          </h1>
          <nav className="space-y-3">
            {tabs.map((item, idx) => (
              <Button
                key={idx}
                variant={activeTab === item.label ? "default" : "ghost"}
                className={`w-full justify-start gap-3 font-semibold cursor-pointer transition ${activeTab === item.label
                    ? "bg-white/20 hover:bg-white/30 text-white hover:text-white"
                    : "hover:bg-white/10 text-white hover:text-white"
                  }`}
                onClick={() => {
                  if (item.label === "Binance Dashboard") {
                    // Open external link
                    window.location.href = "https://binance.advertiserassets.com/"
                  } else {
                    setActiveTab(item.label)
                  }
                }}
              >
                <item.icon className="w-5 h-5" />
                {item.label}
              </Button>
            ))}
          </nav>

        </div>
        <Button onClick={handleLogout} className="w-full cursor-pointer justify-start gap-2 bg-white/20 hover:bg-white/30 text-white transition">
          <LogOut className="w-4 h-4" /> Logout
        </Button>
      </aside>

      {/* Main content */}
      <main className="flex-1 p-8 h-full overflow-auto">
        {activeTab === 'Dashboard' ? (
          <>
            {/* Header */}
            <div className="mb-8">
              <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Dashboard
              </h2>
              <p className="text-gray-600">Overview of clients, ad accounts & reporting.</p>
            </div>

            {/* Stats */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
              {[
                { label: "Clients", value: stats.clients, icon: Users, gradient: "from-blue-700 to-indigo-700" },
                { label: "Ad Accounts", value: stats.adAccounts, icon: BarChart3, gradient: "from-purple-700 to-pink-700" },
                { label: "Active Campaigns", value: stats.activeCampaigns, icon: TrendingUp, gradient: "from-green-700 to-teal-700" },
                { label: "Total Spend", value: formatUSD(stats?.spend), icon: DollarSign, gradient: "from-yellow-700 to-orange-700" },
              ].map((item, idx) => (
                <Card
                  key={idx}
                  className={`bg-gradient-to-br ${item.gradient} text-white shadow-lg hover:shadow-2xl transition rounded-2xl`}
                >
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-semibold">{item.label}</CardTitle>
                    <item.icon className="w-6 h-6" />
                  </CardHeader>
                  <CardContent>
                    {loading ? (
                      <Skeleton className="h-6 w-16 bg-white/50" />
                    ) : (
                      <p className="text-2xl font-bold">{item.value}</p>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Recent Clients */}
            <Card className="mb-8 bg-gradient-to-br from-white via-gray-50 to-gray-100 border border-gray-200 shadow-lg rounded-2xl">
              <CardHeader>
                <CardTitle className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Recent Clients
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="flex justify-between items-center">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-6 w-16" />
                      </div>
                    ))}
                  </div>
                ) : recentClients.length === 0 ? (
                  <p className="text-gray-500 text-sm">No recent clients found.</p>
                ) : (
                  <ul className="divide-y">
                    {recentClients.map((c) => (
                      <li key={c.id} className="flex justify-between items-center py-3">
                        <div>
                          <p className="font-medium text-gray-800">{c.name}</p>
                          <p className="text-sm text-gray-500">{c.email}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          {c.status === "active" ? (
                            <span className="flex items-center gap-1 text-green-600 text-sm">
                              <CheckCircle2 className="w-4 h-4" /> Active
                            </span>
                          ) : (
                            <span className="flex items-center gap-1 text-yellow-600 text-sm">
                              <Clock className="w-4 h-4" /> Pending
                            </span>
                          )}
                          <Button
                            size="sm"
                            variant="outline"
                            className="border-blue-200 text-blue-700 hover:bg-blue-50"
                            asChild
                          ><a
                            href={`/client/${c.id}/dashboard`}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                              View
                            </a>

                          </Button>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </CardContent>
            </Card>

            {/* Reporting Overview */}
            <Card className="bg-gradient-to-br from-white via-gray-50 to-gray-100 border border-gray-200 shadow-lg rounded-2xl">
              <CardHeader>
                <CardTitle className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Reporting Overview
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <Skeleton className="h-64 w-full" />
                ) : (
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <RLineChart data={reportData}>
                        <XAxis dataKey="day" stroke="#6366f1" />
                        <YAxis stroke="#6366f1" />
                        <Tooltip />
                        <Line
                          type="monotone"
                          dataKey="spend"
                          stroke="url(#gradient)"
                          strokeWidth={3}
                          dot={{ r: 4 }}
                        />
                        <defs>
                          <linearGradient id="gradient" x1="0" y1="0" x2="1" y2="0">
                            <stop offset="0%" stopColor="#2563eb" />
                            <stop offset="100%" stopColor="#9333ea" />
                          </linearGradient>
                        </defs>
                      </RLineChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </CardContent>
            </Card>
          </>
        ) : activeTab === 'Clients' ?
          <>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">Clients</h2>
              <Button
                size="lg"
                className="bg-gradient-to-r from-blue-600 cursor-pointer to-purple-600 text-white hover:from-blue-700 hover:to-purple-700"
                onClick={() => setActiveTab('Add Client')}
              >
                <UserPlus className="w-4 h-4" />  Add Client
              </Button>
            </div>

            <div className="overflow-x-auto p-4">
              <table className="w-full table-auto text-left">
                <thead>
                  <tr className="bg-gradient-to-r from-blue-200 via-purple-200 to-indigo-200 text-gray-800">
                    <th className="px-6 py-3 rounded-tl-xl">Name</th>
                    <th className="px-6 py-3">Email</th>
                    <th className="px-6 py-3">Status</th>
                    <th className="px-6 py-3 rounded-tr-xl">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {loadingClients ? (
                    <>
                      {Array.from({ length: clients.length || 5 }).map((_, i) => (
                        <tr key={i}>
                          <td colSpan={4} className="px-4 py-3">
                            <div className="flex justify-between items-center w-full gap-4">
                              <Skeleton className="h-4 flex-1 rounded-md" />
                              <Skeleton className="h-6 w-16 rounded-md" />
                            </div>
                          </td>
                        </tr>
                      ))}

                    </>
                  ) : clients.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="text-center py-6 text-gray-500">
                        No clients found
                      </td>
                    </tr>
                  ) : (
                    clients.map((c) => (
                      <tr
                        key={c.id}
                        className="border-b border-accent hover:shadow-sm  bg-white/80 backdrop-blur-sm"
                      >
                        <td className="px-6 py-4 font-medium text-gray-800">{c.name}</td>
                        <td className="px-6 py-4 text-gray-600">{c.email}</td>
                        <td className="px-6 py-4">
                          <span
                            className={`px-3 py-1 rounded-full text-sm font-semibold ${c.status === "active"
                              ? "bg-green-100 text-green-700"
                              : "bg-yellow-100 text-yellow-700"
                              }`}
                          >
                            {c.status === "active" ? "Active" : "Pending"}
                          </span>
                        </td>
                        <td className="px-6 py-4 flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            className="border-blue-300 cursor-pointer text-blue-600 hover:text-white hover:bg-gradient-to-r hover:from-blue-400 hover:to-blue-600 transition-colors"
                            onClick={() => window.open(`/client/${c.id}/dashboard`, "_blank")}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="border-purple-300 cursor-pointer text-purple-600  hover:text-white hover:bg-gradient-to-r hover:from-purple-400 hover:to-purple-600 transition-colors"
                            onClick={() => setEditClient(c)}
                          >
                            <Edit2 className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => loadAccountsForClient(c.id)}
                          >
                            {selectedAccounts[c.id]?.length > 0
                              ? `${selectedAccounts[c.id].length} accounts selected`
                              : "Select Accounts"}
                          </Button>


                          {/* Connect FB */}
                          {c.fbConnected ? (
                            <Button
                              size="sm"
                              variant="outline"
                              className="border-blue-300 text-white hover:text-white cursor-pointer bg-gradient-to-r from-blue-400 to-blue-600 transition"
                              onClick={() => connectForClient(c.id)}
                            >
                              <Facebook className="w-4 h-4" />
                            </Button>
                          ) : (
                            <Button
                              size="sm"
                              variant="outline"
                              className="border-blue-300 text-blue-700 cursor-pointer hover:text-white hover:bg-gradient-to-r hover:from-blue-400 hover:to-blue-600 transition"
                              onClick={() => connectForClient(c.id)}
                            >
                              <Facebook className="w-4 h-4" /> Connect
                            </Button>
                          )}

                          <Button
                            size="sm"
                            variant="outline"
                            className="border-red-300 text-red-600 cursor-pointer hover:text-white hover:bg-gradient-to-r hover:from-red-400 hover:to-red-600 transition-colors"
                            onClick={() => handleDelete(c.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {isAccountsModalOpen && (
              <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl">
                  <h2 className="text-lg font-semibold mb-4">
                    Select Ad Accounts for Client {selectedClient}
                  </h2>

                  {accountsLoading ? (
                    <p className="text-gray-500">Loading accounts…</p>
                  ) : allAccounts.length === 0 ? (
                    <p className="text-gray-500">No accounts found.</p>
                  ) : (
                    <div className="max-h-60 overflow-y-auto space-y-2 mb-4">
                      {allAccounts.map((acc) => {
                        const selected = selectedAccounts[selectedClient] || [];
                        return (
                          <label key={acc.id} className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={selected.includes(acc.id)} // ✅ only from local state
                              onChange={() => {
                                setSelectedAccounts((prev) => {
                                  const current = prev[selectedClient] || [];
                                  return {
                                    ...prev,
                                    [selectedClient]: current.includes(acc.id)
                                      ? current.filter((x) => x !== acc.id) // remove
                                      : [...current, acc.id], // add
                                  };
                                });
                              }}
                            />
                            <span>{acc.name} ({acc.id})</span>
                          </label>
                        );
                      })}

                    </div>
                  )}

                  <div className="flex justify-end gap-3">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setIsAccountsModalOpen(false);
                        setSelectedClient(null);
                      }}
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={async () => {
                        const chosen = selectedAccounts[selectedClient] || [];
                        await fetch("/api/clients/accounts", {
                          method: "POST",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({
                            clientId: selectedClient,
                            adAccountIds: chosen,
                          }),
                        });
                        setIsAccountsModalOpen(false);
                        setSelectedClient(null);
                      }}
                    >
                      Save Selection
                    </Button>

                  </div>
                </div>
              </div>
            )}


            {/* Add / Edit Client Modal */}
            {(showAddModal || editClient) && (
              <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
                <div className="bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 w-96 p-6 rounded-2xl shadow-2xl border border-white/30">
                  <h3 className="text-xl font-bold mb-5 text-gray-800 text-center">
                    {editClient ? "Edit Client" : "Add Client"}
                  </h3>

                  <form
                    onSubmit={async (e) => {
                      e.preventDefault();
                      setSubmitting(true)
                      const form = e.target;
                      const name = (form.name).value;
                      const email = (form.email).value;
                      const password = (form.password).value;

                      try {
                        await fetch(
                          editClient ? "/api/clients/update" : "/api/clients/create",
                          {
                            method: editClient ? "PUT" : "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify(
                              editClient
                                ? { id: editClient.id, name, email, password }
                                : { name, email, password }
                            ),
                          }
                        );
                        setShowAddModal(false);
                        setEditClient(null);
                        fetchClients();
                      } catch (err) {
                        console.error(err);
                      } finally {
                        setSubmitting(false); // stop loading
                      }
                    }}
                    className="space-y-4"
                  >
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Name</label>
                      <input
                        type="text"
                        name="name"
                        defaultValue={editClient?.name || ""}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 mt-1 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">Email</label>
                      <input
                        type="email"
                        name="email"
                        defaultValue={editClient?.email || ""}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 mt-1 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent transition"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Password {editClient ? "(leave blank to keep current)" : ""}
                      </label>
                      <input
                        type="password"
                        name="password"
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 mt-1 focus:outline-none focus:ring-2 focus:ring-pink-400 focus:border-transparent transition"
                        {...(!editClient && { required: true })}
                      />
                    </div>

                    <div className="flex justify-end gap-3 mt-6">

                      <Button
                        type="submit"
                        className="bg-gradient-to-r from-blue-600 via-purple-600 cursor-pointer to-pink-600 text-white hover:from-blue-700 hover:via-purple-700 hover:to-pink-700 transition flex items-center justify-center"
                        disabled={submitting}
                      >
                        {submitting && (
                          <svg
                            className="animate-spin ml-1 mr-1 h-5 w-5 text-white"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                          >
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                            ></circle>
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8v8H4z"
                            ></path>
                          </svg>
                        )}
                        {submitting ? "Updating" : "Update"}
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        className="border-gray-400 text-gray-700 hover:bg-gray-100 hover:text-gray-900 transition cursor-pointer"
                        onClick={() => {
                          setShowAddModal(false);
                          setEditClient(null);
                        }}
                        disabled={submitting}
                      >
                        Cancel
                      </Button>

                    </div>
                  </form>
                </div>
              </div>
            )}

          </>
          : activeTab === 'Admins' ?
            <>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold">All Admins</h2>
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-blue-600 cursor-pointer to-purple-600 text-white hover:from-blue-700 hover:to-purple-700"
                  onClick={() => setActiveTab('Add Admin')}
                >
                  <UserPlus className="w-4 h-4" />  Add Admin
                </Button>
              </div>

              <div className="overflow-x-auto p-4">
                <table className="w-full table-auto text-left">
                  <thead>
                    <tr className="bg-gradient-to-r from-blue-200 via-purple-200 to-indigo-200 text-gray-800">
                      <th className="px-6 py-3 rounded-tl-xl">Name</th>
                      <th className="px-6 py-3">Email</th>
                      <th className="px-6 py-3">Status</th>
                      <th className="px-6 py-3 rounded-tr-xl">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loadingAdmins ? (
                      <>
                        {Array.from({ length: admins.length || 5 }).map((_, i) => (
                          <tr key={i}>
                            <td colSpan={4} className="px-4 py-3">
                              <div className="flex justify-between items-center w-full gap-4">
                                <Skeleton className="h-4 flex-1 rounded-md" />
                                <Skeleton className="h-6 w-16 rounded-md" />
                              </div>
                            </td>
                          </tr>
                        ))}

                      </>
                    ) : admins.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="text-center py-6 text-gray-500">
                          No admins found
                        </td>
                      </tr>
                    ) : (
                      admins.map((c) => (
                        <tr
                          key={c.id}
                          className="border-b border-accent hover:shadow-sm  bg-white/80 backdrop-blur-sm"
                        >
                          <td className="px-6 py-4 font-medium text-gray-800">{c.name}</td>
                          <td className="px-6 py-4 text-gray-600">{c.email}</td>
                          <td className="px-6 py-4">
                            <span
                              className={`px-3 py-1 rounded-full text-sm font-semibold ${c.status !== "active"
                                ? "bg-green-100 text-green-700"
                                : "bg-yellow-100 text-yellow-700"
                                }`}
                            >
                              {c.status === "active" ? "Active" : "Active"}
                            </span>
                          </td>
                          <td className="px-6 py-4 flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              className="border-purple-300 cursor-pointer text-purple-600  hover:text-white hover:bg-gradient-to-r hover:from-purple-400 hover:to-purple-600 transition-colors"
                              onClick={() => setEditAdmin(c)}
                            >
                              <Edit2 className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="border-red-300 text-red-600 cursor-pointer hover:text-white hover:bg-gradient-to-r hover:from-red-400 hover:to-red-600 transition-colors"
                              onClick={() => handleDeleteAdmin(c._id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Add / Edit Client Modal */}
              {(showAddModal || editClient) && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
                  <div className="bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 w-96 p-6 rounded-2xl shadow-2xl border border-white/30">
                    <h3 className="text-xl font-bold mb-5 text-gray-800 text-center">
                      {editClient ? "Edit Client" : "Add Client"}
                    </h3>

                    <form
                      onSubmit={async (e) => {
                        e.preventDefault();
                        setSubmitting(true)
                        const form = e.target;
                        const name = (form.name).value;
                        const email = (form.email).value;
                        const password = (form.password).value;

                        try {
                          await fetch(
                            editClient ? "/api/clients/update" : "/api/clients/create",
                            {
                              method: editClient ? "PUT" : "POST",
                              headers: { "Content-Type": "application/json" },
                              body: JSON.stringify(
                                editClient
                                  ? { id: editClient.id, name, email, password }
                                  : { name, email, password }
                              ),
                            }
                          );
                          setShowAddModal(false);
                          setEditClient(null);
                          fetchClients();
                        } catch (err) {
                          console.error(err);
                        } finally {
                          setSubmitting(false); // stop loading
                        }
                      }}
                      className="space-y-4"
                    >
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Name</label>
                        <input
                          type="text"
                          name="name"
                          defaultValue={editClient?.name || ""}
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 mt-1 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700">Email</label>
                        <input
                          type="email"
                          name="email"
                          defaultValue={editClient?.email || ""}
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 mt-1 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent transition"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Password {editClient ? "(leave blank to keep current)" : ""}
                        </label>
                        <input
                          type="password"
                          name="password"
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 mt-1 focus:outline-none focus:ring-2 focus:ring-pink-400 focus:border-transparent transition"
                          {...(!editClient && { required: true })}
                        />
                      </div>

                      <div className="flex justify-end gap-3 mt-6">

                        <Button
                          type="submit"
                          className="bg-gradient-to-r from-blue-600 via-purple-600 cursor-pointer to-pink-600 text-white hover:from-blue-700 hover:via-purple-700 hover:to-pink-700 transition flex items-center justify-center"
                          disabled={submitting}
                        >
                          {submitting && (
                            <svg
                              className="animate-spin ml-1 mr-1 h-5 w-5 text-white"
                              xmlns="http://www.w3.org/2000/svg"
                              fill="none"
                              viewBox="0 0 24 24"
                            >
                              <circle
                                className="opacity-25"
                                cx="12"
                                cy="12"
                                r="10"
                                stroke="currentColor"
                                strokeWidth="4"
                              ></circle>
                              <path
                                className="opacity-75"
                                fill="currentColor"
                                d="M4 12a8 8 0 018-8v8H4z"
                              ></path>
                            </svg>
                          )}
                          {submitting ? "Updating" : "Update"}
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          className="border-gray-400 text-gray-700 hover:bg-gray-100 hover:text-gray-900 transition cursor-pointer"
                          onClick={() => {
                            setShowAddModal(false);
                            setEditClient(null);
                          }}
                          disabled={submitting}
                        >
                          Cancel
                        </Button>

                      </div>
                    </form>
                  </div>
                </div>
              )}
              {/* Add / Edit Client Modal */}
              {(showAddModal2 || editAdmin) && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
                  <div className="bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 w-96 p-6 rounded-2xl shadow-2xl border border-white/30">
                    <h3 className="text-xl font-bold mb-5 text-gray-800 text-center">
                      {editAdmin ? "Edit Admin" : "Add Admin"}
                    </h3>

                    <form
                      onSubmit={async (e) => {
                        e.preventDefault();
                        setSubmitting3(true)
                        const form = e.target;
                        const name = (form.name).value;
                        const email = (form.email).value;
                        const password = (form.password).value;

                        try {
                          const url = editAdmin ? "/api/admins/create" : "/api/admins/create"; // choose endpoint
                          const method = editAdmin ? "PUT" : "POST";

                          const payload = editAdmin
                            ? { id: editAdmin.id, name, email, password }
                            : { name, email, password };

                          const res = await fetch(url, {
                            method,
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify(payload),
                          });

                          if (!res.ok) {
                            const errData = await res.json();
                            alert(errData.error || "Failed to save");
                            return;
                          }

                          setShowAddModal2(false);
                          setEditAdmin(null);
                          await fetchAdmins(); // refresh list
                        } catch (err) {
                          console.error(err);
                          alert("Something went wrong.");
                        } finally {
                          setSubmitting3(false); // stop loading
                        }

                      }}
                      className="space-y-4"
                    >
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Name</label>
                        <input
                          type="text"
                          name="name"
                          defaultValue={editAdmin?.name || ""}
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 mt-1 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700">Email</label>
                        <input
                          type="email"
                          name="email"
                          defaultValue={editAdmin?.email || ""}
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 mt-1 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent transition"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Password {editAdmin ? "(leave blank to keep current)" : ""}
                        </label>
                        <input
                          type="password"
                          name="password"
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 mt-1 focus:outline-none focus:ring-2 focus:ring-pink-400 focus:border-transparent transition"
                          {...(!editAdmin && { required: true })}
                        />
                      </div>

                      <div className="flex justify-end gap-3 mt-6">

                        <Button
                          type="submit"
                          className="bg-gradient-to-r from-blue-600 via-purple-600 cursor-pointer to-pink-600 text-white hover:from-blue-700 hover:via-purple-700 hover:to-pink-700 transition flex items-center justify-center"
                          disabled={submitting3}
                        >
                          {submitting3 && (
                            <svg
                              className="animate-spin ml-1 mr-1 h-5 w-5 text-white"
                              xmlns="http://www.w3.org/2000/svg"
                              fill="none"
                              viewBox="0 0 24 24"
                            >
                              <circle
                                className="opacity-25"
                                cx="12"
                                cy="12"
                                r="10"
                                stroke="currentColor"
                                strokeWidth="4"
                              ></circle>
                              <path
                                className="opacity-75"
                                fill="currentColor"
                                d="M4 12a8 8 0 018-8v8H4z"
                              ></path>
                            </svg>
                          )}
                          {submitting3 ? "Updating" : "Update"}
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          className="border-gray-400 text-gray-700 hover:bg-gray-100 hover:text-gray-900 transition cursor-pointer"
                          onClick={() => {
                            setShowAddModal2(false);
                            setEditAdmin(null);
                          }}
                          disabled={submitting3}
                        >
                          Cancel
                        </Button>

                      </div>
                    </form>
                  </div>
                </div>
              )}


            </>
            : activeTab === 'Add Client' ?
              <>
                <div className="mt-30 flex items-center justify-center">
                  <div className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-md">
                    <h1 className="text-2xl font-bold mb-6 text-gray-800">Add New Client</h1>
                    <form onSubmit={handleSubmit} className="space-y-5">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Name
                        </label>
                        <input
                          type="text"
                          name="name"
                          required
                          className="w-full rounded-xl border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-400"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Email
                        </label>
                        <input
                          type="email"
                          name="email"
                          required
                          className="w-full rounded-xl border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-400"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Password
                        </label>
                        <input
                          type="password"
                          name="password"
                          required
                          className="w-full rounded-xl border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-400"
                        />
                      </div>
                      <div className="flex justify-end">
                        <Button
                          type="submit"
                          className="bg-gradient-to-r from-blue-600 via-purple-600 cursor-pointer to-pink-600 text-white hover:from-blue-700 hover:via-purple-700 hover:to-pink-700 transition flex items-center justify-center"
                          disabled={submitting2}
                        >
                          {submitting2 && (
                            <svg
                              className="animate-spin ml-1 mr-1 h-5 w-5 text-white"
                              xmlns="http://www.w3.org/2000/svg"
                              fill="none"
                              viewBox="0 0 24 24"
                            >
                              <circle
                                className="opacity-25"
                                cx="12"
                                cy="12"
                                r="10"
                                stroke="currentColor"
                                strokeWidth="4"
                              ></circle>
                              <path
                                className="opacity-75"
                                fill="currentColor"
                                d="M4 12a8 8 0 018-8v8H4z"
                              ></path>
                            </svg>
                          )}
                          {submitting2 ? "Adding" : "Add Client"}
                        </Button>

                      </div>
                    </form>
                  </div>
                </div>
              </>
              : activeTab === 'Add Admin' ? (
                <div className="mt-30 flex items-center justify-center">
                  <div className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-md">
                    <h1 className="text-2xl font-bold mb-6 text-gray-800">Add New Admin</h1>
                    <form
                      onSubmit={async (e) => {
                        e.preventDefault();
                        const form = e.target;
                        const name = form.name.value;
                        const email = form.email.value;
                        const password = form.password.value;
                        try {
                          const res = await fetch("/api/admins/create", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ name, email, password }),
                          });
                          const data = await res.json();
                          if (data.success) {
                            alert("Admin created successfully!");
                            setActiveTab("Dashboard");
                          } else {
                            alert(data.error || "Failed to add admin");
                          }
                        } catch (err) {
                          alert("Error adding admin");
                        }
                      }}
                      className="space-y-5"
                    >
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                        <input type="text" name="name" required className="w-full border rounded-lg px-4 py-2" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                        <input type="email" name="email" required className="w-full border rounded-lg px-4 py-2" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                        <input type="password" name="password" required className="w-full border rounded-lg px-4 py-2" />
                      </div>
                      <Button
                        type="submit"
                        className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white w-full"
                      >
                        Add Admin
                      </Button>
                    </form>
                  </div>
                </div>
              ) : ''
        }
      </main >
    </div >
  );
}
