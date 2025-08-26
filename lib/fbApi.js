import axios from "axios";

const FB_BASE = "https://graph.facebook.com/v19.0";

export async function getAdAccounts(token) {
  const res = await axios.get(`${FB_BASE}/me/adaccounts`, {
    params: { access_token: token },
  });
  return res.data;
}

export async function getInsights(adAccountId, token, since, until) {
  const res = await axios.get(`${FB_BASE}/act_${adAccountId}/insights`, {
    params: {
      fields: "spend,impressions,clicks",
      time_range: { since, until },
      access_token: token,
    },
  });
  return res.data;
}
