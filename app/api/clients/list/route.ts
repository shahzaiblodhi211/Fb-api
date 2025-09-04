import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import User from "@/models/User";
import FbConnection from "@/models/FbConnection";

export async function GET() {
  await dbConnect();

  const clients = await User.find({ role: "client" })
    .select("_id name email")
    .lean();
  const fbConnections = await FbConnection.find({
    user: { $in: clients.map((c) => c._id) },
  }).lean();

  const clientsWithFB = clients.map((c) => ({
    id: c._id.toString(),
    name: c.name,
    email: c.email,
    status: "active", // optional, can compute real status
    fbConnected: fbConnections.some(
      (fb) => fb.user.toString() === c._id.toString()
    ),
  }));

  return NextResponse.json({ clients: clientsWithFB });
}
