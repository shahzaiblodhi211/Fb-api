// app/page.tsx (Landing page with FB login)
"use client";

import { useState } from "react";

export default function Home() {
  const [loading, setLoading] = useState(false);

const handleLogin = () => {
  const clientId = process.env.NEXT_PUBLIC_FB_APP_ID;
  const redirectUri = process.env.NEXT_PUBLIC_FB_REDIRECT_URI;

  window.location.href = `https://www.facebook.com/v19.0/dialog/oauth?client_id=${clientId}&redirect_uri=${redirectUri}&scope=ads_read,business_management`;
};


  return (
    <main className="flex h-screen items-center justify-center">
      <button
        onClick={handleLogin}
        disabled={loading}
        className="bg-blue-600 text-white px-6 py-3 rounded-lg"
      >
        {loading ? "Redirecting..." : "Login with Facebook"}
      </button>
    </main>
  );
}
