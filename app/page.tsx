"use client";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    (async () => {
      const me = await fetch("/api/auth/me").then(r => r.json());
      if (me.user?.role === "superadmin") router.replace("/admin");
      else if (me.user?.role === "client") router.replace(`/client/${me.user.id}/dashboard`);
    })();
  }, [router]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (!res.ok) {
        setErr(data.error || "Login failed");
        return;
      }
      if (data.user.role === "superadmin") router.replace("/admin");
      else router.replace(`/client/${data.user.id}/dashboard`);
    } catch (error) {
      console.error(error);
      setErr("Something went wrong!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-200 via-purple-200 to-pink-200 px-4">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl p-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2 text-center">Welcome Back</h1>
        <p className="text-gray-600 mb-6 text-center">Sign in to continue</p>
        {err && <div className="mb-4 text-red-600 font-medium text-center">{err}</div>}
        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="block text-gray-700 font-semibold mb-1">Email</label>
            <input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full rounded-xl border border-gray-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent text-md transition"
              required
            />
          </div>
          <div>
            <label className="block text-gray-700 font-semibold mb-1">Password</label>
            <input
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full rounded-xl border border-gray-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent text-md transition"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full cursor-pointer bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 text-white py-3 rounded-xl font-semibold shadow-lg hover:from-blue-500 hover:via-purple-500 hover:to-pink-500 transition flex justify-center items-center gap-2"
            disabled={loading}
          >
            {loading ? <Loader2 className="animate-spin h-5 w-5" /> : "Sign In"}
          </button>
        </form>
        <p className="mt-8 text-center text-gray-400 text-xs">
          &copy; {new Date().getFullYear()} Advertiser Assests. All rights reserved.
        </p>


      </div>
    </main>
  );
}
