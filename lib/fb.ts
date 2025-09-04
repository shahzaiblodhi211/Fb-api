export const FB_API = "https://graph.facebook.com/v19.0";

export function fbAuthUrl({
  clientId,
  redirectUri,
  scope,
  state,
}: {
  clientId: string;
  redirectUri: string;
  scope: string;
  state: string;
}) {
  const url = new URL("https://www.facebook.com/v19.0/dialog/oauth");
  url.searchParams.set("client_id", clientId);
  url.searchParams.set("redirect_uri", redirectUri);
  url.searchParams.set("scope", scope);
  url.searchParams.set("state", state);
  return url.toString();
}

export async function exchangeCodeForToken(code: string, redirectUri: string) {
  const appId = process.env.NEXT_PUBLIC_FB_APP_ID!;
  const secret = process.env.FB_APP_SECRET!;
  const url = `${FB_API}/oauth/access_token?client_id=${appId}&redirect_uri=${encodeURIComponent(
    redirectUri
  )}&client_secret=${secret}&code=${encodeURIComponent(code)}`;
  const res = await fetch(url, { cache: "no-store" });
  return res.json();
}

export async function fetchMe(accessToken: string) {
  const res = await fetch(`${FB_API}/me?fields=id,name&access_token=${accessToken}`, {
    cache: "no-store",
  });
  return res.json();
}

export async function fetchAdAccounts(accessToken: string) {
  const res = await fetch(
    `${FB_API}/me/adaccounts?fields=id,name,account_status,balance,amount_spent&access_token=${accessToken}`,
    { cache: "no-store" }
  );
  return res.json();
}

// New: Fetch campaigns for an ad account
export async function fetchCampaigns(adAccountId: string, accessToken: string) {
  const url = `${FB_API}/${adAccountId}/campaigns?fields=id,name,status&access_token=${accessToken}`;
  const res = await fetch(url, { cache: "no-store" });
  return res.json();
}

export async function fetchSpendRange(
  adAccountId: string,
  since: string,
  until: string,
  accessToken: string
) {
  const url = `${FB_API}/${adAccountId}/insights?fields=spend&level=account&time_increment=all_days&time_range[since]=${since}&time_range[until]=${until}&access_token=${accessToken}`;
  const res = await fetch(url, { cache: "no-store" });
  return res.json();
}
