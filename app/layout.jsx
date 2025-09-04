import "./globals.css";
import React from "react";
import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

export const metadata = { title: "Advertiser Assets App", description: "Ad Account Reporting" };

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gray-50 text-gray-900">
        <div>{children}</div>
      </body>
    </html>
  );
}
