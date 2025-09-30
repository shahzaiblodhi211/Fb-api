import mongoose, { Schema, Document } from "mongoose";

export interface IClientAdAccounts extends Document {
  clientId: string; // your client _id
  adAccountIds: string[];
}

const ClientAdAccountsSchema = new Schema<IClientAdAccounts>(
  {
    clientId: { type: String, required: true, unique: true },
    adAccountIds: { type: [String], default: [] },
  },
  { timestamps: true }
);

export default mongoose.models.ClientAdAccounts ||
  mongoose.model<IClientAdAccounts>("ClientAdAccounts", ClientAdAccountsSchema);
