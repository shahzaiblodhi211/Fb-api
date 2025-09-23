export const FB_API = "https://graph.facebook.com/v21.0";

/**
 * Build Facebook OAuth URL
 */
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
  const url = new URL(`${FB_API.replace("graph.", "www.")}/dialog/oauth`);
  url.searchParams.set("client_id", clientId);
  url.searchParams.set("redirect_uri", redirectUri);
  url.searchParams.set("scope", scope);
  url.searchParams.set("state", state);
  return url.toString();
}

/**
 * Exchange auth code for access token
 */
export async function exchangeCodeForToken(code: string, redirectUri: string) {
  const appId = process.env.NEXT_PUBLIC_FB_APP_ID!;
  const secret = process.env.FB_APP_SECRET!;
  const url = `${FB_API}/oauth/access_token?client_id=${appId}&redirect_uri=${encodeURIComponent(
    redirectUri
  )}&client_secret=${secret}&code=${encodeURIComponent(code)}`;

  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) throw new Error(`Token exchange failed: ${res.statusText}`);
  return res.json();
}

/**
 * Get current user (me)
 */
export async function fetchMe(accessToken: string) {
  const res = await fetch(
    `${FB_API}/me?fields=id,name&access_token=${accessToken}`,
    { cache: "no-store" }
  );
  if (!res.ok) throw new Error(`Failed to fetch profile: ${res.statusText}`);
  return res.json();
}

/**
 * Fetch ad accounts for the current user
 * - balance works only for pre-paid accounts
 * - amount_spent is lifetime, in minor units (e.g. cents)
 */
export async function fetchAdAccounts(accessToken: string) {
  const fields = [
    "id",
    "name",
    "account_status",
    "currency",
    "balance",
    "amount_spent",
    "spend_cap",
  ].join(",");

  const url = `${FB_API}/me/adaccounts?fields=${fields}&access_token=${accessToken}`;
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) throw new Error(`Failed to fetch ad accounts: ${res.statusText}`);
  return res.json();
}

/**
 * Fetch businesses connected to the current user
 */
export async function fetchBusinesses(accessToken: string) {
  const url = `${FB_API}/me/businesses?fields=id,name,created_time&access_token=${accessToken}`;
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) throw new Error(`Failed to fetch businesses: ${res.statusText}`);
  return res.json();
}

/**
 * Fetch campaigns under a specific ad account
 */
export async function fetchCampaigns(adAccountId: string, accessToken: string) {
  const url = `${FB_API}/${adAccountId}/campaigns?fields=id,name,status&access_token=${accessToken}`;
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) throw new Error(`Failed to fetch campaigns: ${res.statusText}`);
  return res.json();
}

/**
 * Fetch spend range (total spend between since/until)
 */
export async function fetchSpendRange(
  adAccountId: string,
  since: string,
  until: string,
  accessToken: string
) {
  const url = `${FB_API}/${adAccountId}/insights?fields=spend&level=account&time_increment=all_days&time_range[since]=${since}&time_range[until]=${until}&access_token=${accessToken}`;
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) throw new Error(`Failed to fetch spend range: ${res.statusText}`);
  return res.json();
}
