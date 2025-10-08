import mongoose, { Schema, models, model, Document } from "mongoose";

export interface IUser extends Document {
  email: string;
  name?: string;
  role: "superadmin" | "admin" | "client";
  passwordHash: string;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    email: { type: String, required: true, unique: true, index: true },
    name: { type: String },
    role: {
      type: String,
      enum: ["superadmin", "admin", "client"],
      required: true,
      default: "client", // ✅ sensible default
    },
    passwordHash: { type: String, required: true },
  },
  { timestamps: true } // ✅ adds createdAt + updatedAt automatically
);

const User = models.User || model<IUser>("User", UserSchema);

export default User;
