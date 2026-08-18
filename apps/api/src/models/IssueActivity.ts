import mongoose, { Schema, Document, Types } from "mongoose";

export interface IssueActivityDoc extends Document {
  issueId: Types.ObjectId;
  userId?: Types.ObjectId;
  action: string;
  oldValue?: string;
  newValue?: string;
  createdAt: Date;
}

const schema = new Schema<IssueActivityDoc>(
  {
    issueId: { type: Schema.Types.ObjectId, ref: "Issue", required: true, index: true },
    userId: { type: Schema.Types.ObjectId, ref: "User" },
    action: { type: String, required: true },
    oldValue: String,
    newValue: String,
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

export const IssueActivity = mongoose.model<IssueActivityDoc>("IssueActivity", schema);
