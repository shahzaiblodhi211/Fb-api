// models/FbConnection.js
import mongoose from "mongoose";

const { Schema, model, models } = mongoose;

const FbConnectionSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    facebookUserId: { type: String, required: true },
    accessToken: { type: String, required: true },
    tokenType: { type: String },
    expiresAt: { type: Date },
    scopes: { type: [String], default: [] },
    adAccountsCached: { type: [Schema.Types.Mixed], default: [] },
    connectedBy: { type: Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

FbConnectionSchema.index({ user: 1 }, { unique: true });

const FbConnection =
  models.FbConnection || model("FbConnection", FbConnectionSchema);

export default FbConnection;
