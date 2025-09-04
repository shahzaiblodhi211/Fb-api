import { Schema, models, model, Document, Types } from "mongoose";

export interface IReport extends Document {
  user: Types.ObjectId;      // client id
  adAccountId: string;
  dateFrom: string;          // yyyy-mm-dd
  dateTo: string;            // yyyy-mm-dd
  spend: number;
  raw?: any;
  createdAt: Date;
}

const ReportSchema = new Schema<IReport>({
  user: { type: Schema.Types.ObjectId, ref: "User", index: true, required: true },
  adAccountId: { type: String, index: true, required: true },
  dateFrom: { type: String, required: true },
  dateTo: { type: String, required: true },
  spend: { type: Number, default: 0 },
  raw: Schema.Types.Mixed
}, { timestamps: true });

ReportSchema.index({ user: 1, adAccountId: 1, dateFrom: 1, dateTo: 1 }, { unique: true });

export default models.Report || model<IReport>("Report", ReportSchema);
