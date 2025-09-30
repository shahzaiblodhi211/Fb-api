import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import Client from "@/models/Client";

// ✅ Loosen typing for context to avoid Promise<{id}>
export async function GET(req: NextRequest, context: any) {
  await dbConnect();

  const { id } = context.params; // works at runtime
  const client = await Client.findById(id).lean();

  if (!client) {
    return NextResponse.json({ error: "Client not found" }, { status: 404 });
  }

  return NextResponse.json({ adAccountIds: client.adAccountIds || [] });
}
