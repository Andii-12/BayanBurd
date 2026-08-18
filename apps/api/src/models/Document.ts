import mongoose, { Schema, Document, Types } from "mongoose";
import type { DocumentType } from "@bbe/types";

export interface DocumentFileDoc extends Document {
  clientId: Types.ObjectId;
  assetId?: Types.ObjectId;
  orderId?: Types.ObjectId;
  type: DocumentType;
  name: string;
  url: string;
  mime?: string;
  size?: number;
  createdAt: Date;
}

const schema = new Schema<DocumentFileDoc>(
  {
    clientId: { type: Schema.Types.ObjectId, ref: "Client", required: true, index: true },
    assetId: { type: Schema.Types.ObjectId, ref: "Asset" },
    orderId: { type: Schema.Types.ObjectId, ref: "Order" },
    type: {
      type: String,
      enum: [
        "MANUAL",
        "WARRANTY",
        "INVOICE",
        "INSTALLATION_REPORT",
        "CONTRACT",
        "LICENSE",
        "TECHNICAL_SPEC",
        "SERVICE_REPORT",
        "OTHER",
      ],
      required: true,
    },
    name: { type: String, required: true },
    url: { type: String, required: true },
    mime: String,
    size: Number,
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

export const DocumentFile = mongoose.model<DocumentFileDoc>("Document", schema);
