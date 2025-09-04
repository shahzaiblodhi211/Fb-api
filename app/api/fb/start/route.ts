import { NextRequest, NextResponse } from "next/server";
import { getUserFromRequest } from "../../../../lib/auth";
import { fbAuthUrl } from "../../../../lib/fb";

export async function GET(req: NextRequest) {
  const me = await getUserFromRequest(req);
  if (!me) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const targetClientId = searchParams.get("clientId") || String(me._id); // if admin -> connect for client

  const state = Buffer.from(JSON.stringify({
    targetClientId,
    connectedBy: String(me._id)
  })).toString("base64");

  const url = fbAuthUrl({
    clientId: process.env.NEXT_PUBLIC_FB_APP_ID!,
    redirectUri: process.env.NEXT_PUBLIC_FB_REDIRECT_URI!,
    scope: "ads_read,business_management",
    state
  });

  return NextResponse.json({ url });
}
