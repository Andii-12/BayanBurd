import mongoose, { Schema, Document, Types } from "mongoose";
import type { InstallationStatus } from "@bbe/types";

export interface InstallationDoc extends Document {
  clientId: Types.ObjectId;
  orderId?: Types.ObjectId;
  assetId?: Types.ObjectId;
  installationType: string;
  scheduledDate: Date;
  scheduledTime?: string;
  location: string;
  engineerId?: Types.ObjectId;
  notes?: string;
  status: InstallationStatus;
  completedAt?: Date;
  completionData?: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

const schema = new Schema<InstallationDoc>(
  {
    clientId: { type: Schema.Types.ObjectId, ref: "Client", required: true, index: true },
    orderId: { type: Schema.Types.ObjectId, ref: "Order" },
    assetId: { type: Schema.Types.ObjectId, ref: "Asset" },
    installationType: { type: String, required: true },
    scheduledDate: { type: Date, required: true, index: true },
    scheduledTime: String,
    location: { type: String, required: true },
    engineerId: { type: Schema.Types.ObjectId, ref: "User" },
    notes: String,
    status: {
      type: String,
      enum: ["SCHEDULED", "ON_THE_WAY", "IN_PROGRESS", "COMPLETED", "FAILED", "RESCHEDULED"],
      default: "SCHEDULED",
      index: true,
    },
    completedAt: Date,
    completionData: Schema.Types.Mixed,
  },
  { timestamps: true }
);

export const Installation = mongoose.model<InstallationDoc>("Installation", schema);
