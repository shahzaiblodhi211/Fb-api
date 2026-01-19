import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { dbConnect } from "@/lib/db";
import User from "@/models/User";
import { getUserFromRequest } from "@/lib/auth";

/**
 * Create new admin — only Superadmin allowed
 */
export async function POST(req) {
  await dbConnect();
  const user = await getUserFromRequest(req);
  if (!user || user.role !== "superadmin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const { name, email, password } = await req.json();
  if (!email || !password) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  const existing = await User.findOne({ email });
  if (existing) {
    return NextResponse.json({ error: "Email already in use" }, { status: 400 });
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const newAdmin = await User.create({
    name,
    email,
    passwordHash,
    role: "admin",
  });

  return NextResponse.json({ success: true, admin: newAdmin });
}

/**
 * List all admins — only Superadmin allowed
 */
export async function GET(req) {
  await dbConnect();
  const user = await getUserFromRequest(req);
  if (!user || user.role !== "superadmin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const admins = await User.find({ role: "admin" })
    .select("_id name email createdAt")
    .sort({ createdAt: -1 })
    .lean();

  const adminsWithId = admins.map(admin => ({
    id: admin._id.toString(),
    name: admin.name,
    email: admin.email,
    status: "active", // assuming all are active
  }));

  return NextResponse.json({ admins: adminsWithId });
}

/**
 * Update admin — only Superadmin allowed
 */
export async function PUT(req) {
  await dbConnect();
  const user = await getUserFromRequest(req);
  if (!user || user.role !== "superadmin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const { id, name, email, password } = await req.json();
  if (!id) return NextResponse.json({ error: "Missing admin ID" }, { status: 400 });

  const admin = await User.findOne({ _id: id, role: "admin" });
  if (!admin) return NextResponse.json({ error: "Admin not found" }, { status: 404 });

  if (name) admin.name = name;
  if (email) admin.email = email;
  if (password) admin.passwordHash = await bcrypt.hash(password, 10);

  await admin.save();

  return NextResponse.json({ success: true, admin });
}

/**
 * Delete admin — only Superadmin allowed
 */
export async function DELETE(req) {
  await dbConnect();
  const user = await getUserFromRequest(req);
  if (!user || user.role !== "superadmin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const { id } = await req.json();
  if (!id) return NextResponse.json({ error: "Missing admin ID" }, { status: 400 });

  const deleted = await User.findOneAndDelete({ _id: id, role: "admin" });
  if (!deleted) return NextResponse.json({ error: "Admin not found" }, { status: 404 });

  return NextResponse.json({ success: true });
}
