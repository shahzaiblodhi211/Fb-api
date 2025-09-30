import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import Client from "../../../../models/Client";


export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  await dbConnect();
  const client = await Client.findById(params.id).lean();

  if (!client) {
    return NextResponse.json({ error: "Client not found" }, { status: 404 });
  }

  return NextResponse.json({ adAccountIds: client.adAccountIds || [] });
}
