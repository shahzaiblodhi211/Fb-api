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
  const res = await fetch(
    `${FB_API}/me?fields=id,name&access_token=${accessToken}`,
    {
      cache: "no-store",
    }
  );
  return res.json();
}

export async function fetchAdAccounts(accessToken: string) {
  const res = await fetch(
    `${FB_API}/me/adaccounts?fields=id,name,account_status,balance,amount_spent,spend_cap&access_token=${accessToken}`,
    { cache: "no-store" }
  );

  const json = await res.json();

  // Optionally add a calculated `remaining_limit` (spend_cap – amount_spent)
  if (json?.data) {
    json.data = json.data.map((a: any) => {
      const spendCap = a.spend_cap ? Number(a.spend_cap) : null;
      const spent = a.amount_spent ? Number(a.amount_spent) : 0;
      return {
        ...a,
        remaining_limit:
          spendCap !== null ? (spendCap - spent) / 100 : null // null if no limit set
      };
    });
  }

  return json;
}

export async function fetchBusinesses(accessToken) {
  const url = `https://graph.facebook.com/v21.0/me/businesses?fields=id,name,created_time&access_token=${accessToken}`;
  const res = await fetch(url);
  return await res.json();
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
