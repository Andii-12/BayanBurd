import mongoose, { Schema, Document, Types } from "mongoose";
import type { IssueStatus, IssuePriority } from "@bbe/types";

export interface IssueDoc extends Document {
  issueNumber: string;
  clientId: Types.ObjectId;
  assetId: Types.ObjectId;
  title: string;
  description: string;
  category: string;
  priority: IssuePriority;
  status: IssueStatus;
  assignedAdminId?: Types.ObjectId;
  createdBy: Types.ObjectId;
  attachments: { name: string; url: string; mime: string; size: number }[];
  openedAt: Date;
  assignedAt?: Date;
  startedAt?: Date;
  resolvedAt?: Date;
  closedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const schema = new Schema<IssueDoc>(
  {
    issueNumber: { type: String, required: true, unique: true, index: true },
    clientId: { type: Schema.Types.ObjectId, ref: "Client", required: true, index: true },
    assetId: { type: Schema.Types.ObjectId, ref: "Asset", required: true, index: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    category: { type: String, required: true },
    priority: { type: String, enum: ["LOW", "MEDIUM", "HIGH", "CRITICAL"], default: "MEDIUM", index: true },
    status: {
      type: String,
      enum: [
        "OPEN",
        "ASSIGNED",
        "IN_PROGRESS",
        "WAITING_CLIENT",
        "WAITING_PART",
        "RESOLVED",
        "CLOSED",
        "REOPENED",
      ],
      default: "OPEN",
      index: true,
    },
    assignedAdminId: { type: Schema.Types.ObjectId, ref: "User" },
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    attachments: {
      type: [{ name: String, url: String, mime: String, size: Number }],
      default: [],
    },
    openedAt: { type: Date, default: Date.now },
    assignedAt: Date,
    startedAt: Date,
    resolvedAt: Date,
    closedAt: Date,
  },
  { timestamps: true }
);

schema.index({ title: "text", issueNumber: "text", description: "text" });

export const Issue = mongoose.model<IssueDoc>("Issue", schema);
