import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "../../../../lib/db";
import FbConnection from "../../../../models/FbConnection";
import {
  exchangeCodeForToken,
  fetchMe,
  fetchAdAccounts,
} from "../../../../lib/fb";

export async function GET(req) {
  await dbConnect();
  const { searchParams } = new URL(req.url);
  const code = searchParams.get("code");
  const stateRaw = searchParams.get("state");
  const error = searchParams.get("error");

  if (error)
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/?error=${encodeURIComponent(error)}`
    );
  if (!code || !stateRaw)
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/?error=missing_code_state`
    );

  let state;
  try {
    state = JSON.parse(Buffer.from(stateRaw, "base64").toString("utf8"));
  } catch {
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/?error=bad_state`
    );
  }

  const tokenData = await exchangeCodeForToken(
    code,
    process.env.NEXT_PUBLIC_FB_REDIRECT_URI
  );
  if (tokenData.error) {
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/?error=${encodeURIComponent(
        tokenData.error.message || "token_error"
      )}`
    );
  }

  const accessToken = tokenData.access_token;
  const me = await fetchMe(accessToken);
  if (me.error)
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/?error=me_error`
    );

  // optional: cache ad accounts at connect time
  const accs = await fetchAdAccounts(accessToken);
  const adAccountsCached = accs?.data || [];

  await FbConnection.findOneAndUpdate(
    { user: state.targetClientId },
    {
      user: state.targetClientId,
      facebookUserId: me.id,
      accessToken,
      tokenType: tokenData.token_type,
      scopes: [], // FB doesn’t always return scopes here
      adAccountsCached,
      connectedBy: state.connectedBy,
    },
    { upsert: true, new: true }
  );
  const businesses = await fetchBusinesses(accessToken);
  const businessesCached = businesses?.data || [];

  await FbConnection.findOneAndUpdate(
    { user: state.targetClientId },
    {
      user: state.targetClientId,
      facebookUserId: me.id,
      accessToken,
      adAccountsCached,
      businessesCached, // <-- new field
      connectedBy: state.connectedBy,
    },
    { upsert: true, new: true }
  );

  // Redirect to the client’s dashboard
  return NextResponse.redirect(
    `${process.env.NEXT_PUBLIC_APP_URL}/client/${state.targetClientId}/dashboard?connected=1`
  );
}
