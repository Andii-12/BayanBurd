import mongoose, { Schema, Document, Types } from "mongoose";
import type { CommentVisibility } from "@bbe/types";

export interface IssueCommentDoc extends Document {
  issueId: Types.ObjectId;
  userId: Types.ObjectId;
  body: string;
  visibility: CommentVisibility;
  attachments: { name: string; url: string; mime: string; size: number }[];
  createdAt: Date;
  updatedAt: Date;
}

const schema = new Schema<IssueCommentDoc>(
  {
    issueId: { type: Schema.Types.ObjectId, ref: "Issue", required: true, index: true },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    body: { type: String, required: true },
    visibility: { type: String, enum: ["PUBLIC", "INTERNAL"], default: "PUBLIC" },
    attachments: { type: [{ name: String, url: String, mime: String, size: Number }], default: [] },
  },
  { timestamps: true }
);

export const IssueComment = mongoose.model<IssueCommentDoc>("IssueComment", schema);
