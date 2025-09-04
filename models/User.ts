import { Schema, models, model, Document } from "mongoose";

export interface IUser extends Document {
  email: string;
  name?: string;
  role: "superadmin" | "client";
  passwordHash: string;             // bcrypt hash
  createdAt: Date;
}

const UserSchema = new Schema<IUser>({
  email: { type: String, unique: true, required: true, index: true },
  name: String,
  role: { type: String, enum: ["superadmin", "client"], required: true },
  passwordHash: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

export default models.User || model<IUser>("User", UserSchema);
