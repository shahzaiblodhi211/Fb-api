import { NextResponse } from "next/server";

export async function GET(req) {
  const cookie = req.headers.get("cookie") || "";
  const tokenMatch = cookie.match(/fb_token=([^;]+)/);

  if (!tokenMatch) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const accessToken = tokenMatch[1];

  const accountsRes = await fetch(
    `https://graph.facebook.com/v19.0/me/adaccounts?fields=name,account_status,spend_cap,amount_spent,balance&access_token=${accessToken}`
  );

  const accounts = await accountsRes.json();

  return NextResponse.json(accounts);
}
