// app/dashboard/page.tsx
"use client";

import { useEffect, useState } from "react";

export default function Dashboard() {
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAccounts = async () => {
      const res = await fetch("/api/fb/adaccounts");
      const data = await res.json();
      setAccounts(data.data || []);
      setLoading(false);
    };
    fetchAccounts();
  }, []);

  if (loading)
    return (
      <p className="text-center mt-20 text-lg text-gray-500 animate-pulse">
        Loading ad accounts...
      </p>
    );

  return (
    <main className="p-6 md:p-10 bg-white">
      <h1 className="text-3xl font-bold mb-8 text-gray-800">Ad Accounts</h1>

      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-200 rounded-lg shadow-md">
          <thead className="bg-gray-100">
            <tr>
              {["Name", "Status", "Amount Spent", "Balance", "Spend Cap"].map(
                (col) => (
                  <th
                    key={col}
                    className="border-b p-4 text-left text-gray-600 uppercase tracking-wider"
                  >
                    {col}
                  </th>
                )
              )}
            </tr>
          </thead>

          <tbody>
            {accounts.length === 0 ? (
              <tr>
                <td
                  colSpan={5}
                  className="text-center p-6 text-gray-500 italic"
                >
                  No ad accounts found.
                </td>
              </tr>
            ) : (
              accounts.map((acc) => (
                <tr
                  key={acc.id}
                  className="hover:bg-gray-50 transition-colors duration-200"
                >
                  <td className="border-b p-4">{acc.name}</td>
                  <td className="border-b p-4">
                    {acc.account_status === 1 ? "Active" : "Disabled"}
                  </td>
                  <td className="border-b p-4">${acc.amount_spent}</td>
                  <td className="border-b p-4">
                    {acc.balance !== undefined ? `$${acc.balance}` : "-"}
                  </td>
                  <td className="border-b p-4">
                    {acc.spend_cap !== undefined ? `$${acc.spend_cap}` : "-"}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </main>
  );
}
