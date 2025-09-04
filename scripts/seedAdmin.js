// scripts/seedAdmin.ts
import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import User from "../models/User";
import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
  
async function main() {
  await mongoose.connect(process.env.MONGODB_URI);

  const email = "admin@giantmetrix.com";
  const password = "giantmetrix@admin2154";
  const passwordHash = await bcrypt.hash(password, 10);

  const existing = await User.findOne({ email });
  if (existing) {
    console.log("Super admin already exists:", existing.email);
    process.exit(0);
  }

  const admin = new User({
    email,
    passwordHash,
    name: "Super Admin",
    role: "superadmin",
  });

  await admin.save();
  console.log("✅ Super admin created:", email, "password:", password);

  process.exit(0);
}

main();
