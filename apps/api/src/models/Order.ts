import mongoose, { Schema, Document, Types } from "mongoose";
import type { OrderStatus, PaymentMethod, PaymentStatus } from "@bbe/types";

export interface OrderItemDoc {
  productId: Types.ObjectId;
  name: string;
  sku: string;
  quantity: number;
  unitPrice: number;
  installation: boolean;
  quotationOnly: boolean;
}

export interface OrderDoc extends Document {
  orderNumber: string;
  clientId: Types.ObjectId;
  userId: Types.ObjectId;
  items: OrderItemDoc[];
  subtotal: number;
  total: number;
  status: OrderStatus;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  contactName: string;
  phone: string;
  email: string;
  billingAddress?: string;
  deliveryLocation?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const schema = new Schema<OrderDoc>(
  {
    orderNumber: { type: String, required: true, unique: true, index: true },
    clientId: { type: Schema.Types.ObjectId, ref: "Client", required: true, index: true },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    items: [
      {
        productId: { type: Schema.Types.ObjectId, ref: "Product", required: true },
        name: String,
        sku: String,
        quantity: Number,
        unitPrice: Number,
        installation: Boolean,
        quotationOnly: Boolean,
      },
    ],
    subtotal: Number,
    total: Number,
    status: {
      type: String,
      enum: [
        "PENDING",
        "CONFIRMED",
        "PROCESSING",
        "READY",
        "DELIVERING",
        "DELIVERED",
        "INSTALLATION_PENDING",
        "COMPLETED",
        "CANCELLED",
      ],
      default: "PENDING",
      index: true,
    },
    paymentMethod: { type: String, enum: ["BANK_TRANSFER", "INVOICE", "MANUAL"], default: "INVOICE" },
    paymentStatus: {
      type: String,
      enum: ["UNPAID", "PENDING_VERIFICATION", "PAID", "FAILED"],
      default: "UNPAID",
    },
    contactName: String,
    phone: String,
    email: String,
    billingAddress: String,
    deliveryLocation: String,
    notes: String,
  },
  { timestamps: true }
);

export const Order = mongoose.model<OrderDoc>("Order", schema);
export const Counter = mongoose.model(
  "Counter",
  new Schema({ key: { type: String, unique: true }, seq: { type: Number, default: 0 } })
);
