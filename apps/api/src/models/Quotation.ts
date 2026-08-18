import mongoose, { Schema, Document, Types } from "mongoose";
import type { QuotationStatus } from "@bbe/types";

export interface QuotationDoc extends Document {
  quotationNumber: string;
  clientId?: Types.ObjectId;
  companyName: string;
  contactName: string;
  email: string;
  phone: string;
  requirements?: string;
  items: { productId?: Types.ObjectId; name: string; quantity: number; unitPrice?: number }[];
  attachments: { name: string; url: string }[];
  status: QuotationStatus;
  total?: number;
  notes?: string;
  convertedOrderId?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const schema = new Schema<QuotationDoc>(
  {
    quotationNumber: { type: String, required: true, unique: true },
    clientId: { type: Schema.Types.ObjectId, ref: "Client" },
    companyName: { type: String, required: true },
    contactName: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    requirements: String,
    items: [
      {
        productId: { type: Schema.Types.ObjectId, ref: "Product" },
        name: String,
        quantity: Number,
        unitPrice: Number,
      },
    ],
    attachments: { type: [{ name: String, url: String }], default: [] },
    status: {
      type: String,
      enum: ["NEW", "REVIEWING", "SENT", "APPROVED", "REJECTED", "EXPIRED", "CONVERTED_TO_ORDER"],
      default: "NEW",
      index: true,
    },
    total: Number,
    notes: String,
    convertedOrderId: { type: Schema.Types.ObjectId, ref: "Order" },
  },
  { timestamps: true }
);

export const Quotation = mongoose.model<QuotationDoc>("Quotation", schema);
