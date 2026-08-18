import mongoose, { Schema, Document, Types } from "mongoose";

export interface ServiceHistoryDoc extends Document {
  assetId: Types.ObjectId;
  clientId: Types.ObjectId;
  issueId?: Types.ObjectId;
  title: string;
  cause?: string;
  actionTaken?: string;
  partsReplaced?: string;
  engineerId?: Types.ObjectId;
  performedAt: Date;
  notes?: string;
  createdAt: Date;
}

const schema = new Schema<ServiceHistoryDoc>(
  {
    assetId: { type: Schema.Types.ObjectId, ref: "Asset", required: true, index: true },
    clientId: { type: Schema.Types.ObjectId, ref: "Client", required: true, index: true },
    issueId: { type: Schema.Types.ObjectId, ref: "Issue" },
    title: { type: String, required: true },
    cause: String,
    actionTaken: String,
    partsReplaced: String,
    engineerId: { type: Schema.Types.ObjectId, ref: "User" },
    performedAt: { type: Date, default: Date.now },
    notes: String,
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

export const ServiceHistory = mongoose.model<ServiceHistoryDoc>("ServiceHistory", schema);
