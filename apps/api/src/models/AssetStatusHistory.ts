import mongoose, { Schema, Document, Types } from "mongoose";

export interface AssetStatusHistoryDoc extends Document {
  assetId: Types.ObjectId;
  userId?: Types.ObjectId;
  oldStatus?: string;
  newStatus: string;
  note?: string;
  createdAt: Date;
}

const schema = new Schema<AssetStatusHistoryDoc>(
  {
    assetId: { type: Schema.Types.ObjectId, ref: "Asset", required: true, index: true },
    userId: { type: Schema.Types.ObjectId, ref: "User" },
    oldStatus: String,
    newStatus: { type: String, required: true },
    note: String,
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

export const AssetStatusHistory = mongoose.model<AssetStatusHistoryDoc>(
  "AssetStatusHistory",
  schema
);
