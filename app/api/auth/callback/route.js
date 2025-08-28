// app/api/auth/callback/route.ts
import { NextResponse } from "next/server";

export async function GET(req) {
  const url = new URL(req.url);
  const code = url.searchParams.get("code");

  if (!code) return NextResponse.json({ error: "No code found" }, { status: 400 });

  const tokenRes = await fetch(
    `https://graph.facebook.com/v19.0/oauth/access_token?client_id=1312918976884842&redirect_uri=https://fb-api-ten.vercel.app/api/auth/callback&client_secret=4c91bb616e633bdef24965be0ee7519f&code=${code}`
  );

  const data = await tokenRes.json();

  if (data.error) return NextResponse.json({ error: data.error }, { status: 400 });
  console.log('error')
  const res = NextResponse.redirect(new URL("/dashboard", req.url));
  res.cookies.set("fb_token", data.access_token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 60 // 60 days
  });

  return res;
}
