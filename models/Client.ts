import mongoose, { Schema, Document, Model } from "mongoose";

export interface IClient extends Document {
  name: string;
  email?: string;
  role?: string; // e.g., "client", "admin", etc.
  fbConnected?: boolean;
  adAccountIds: string[]; // ✅ stores selected FB Asd Accounts
  createdAt: Date;
  updatedAt: Date;
}

const ClientSchema: Schema<IClient> = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String },
    role: { type: String, default: "client" },
    fbConnected: { type: Boolean, default: false },
    adAccountIds: { type: [String], default: [] }, // ✅ NEW field
  },
  { timestamps: true }
);

const Client: Model<IClient> =
  mongoose.models.Client || mongoose.model<IClient>("Client", ClientSchema);

export default Client;
