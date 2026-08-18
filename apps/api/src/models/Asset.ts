import mongoose, { Schema, Document, Types } from "mongoose";
import type { AssetType, AssetStatus } from "@bbe/types";

export interface AssetDoc extends Document {
  assetCode: string;
  clientId: Types.ObjectId;
  orderId?: Types.ObjectId;
  orderItemId?: string;
  name: string;
  type: AssetType;
  category?: string;
  productId?: Types.ObjectId;
  manufacturer?: string;
  model?: string;
  serialNumber?: string;
  version?: string;
  websiteUrl?: string;
  systemUrl?: string;
  licenseKeyMasked?: string;
  licenseStartDate?: Date;
  licenseEndDate?: Date;
  installationDate?: Date;
  warrantyStartDate?: Date;
  warrantyEndDate?: Date;
  serviceStartDate?: Date;
  serviceEndDate?: Date;
  location?: string;
  department?: string;
  assignedContact?: string;
  environment?: string;
  status: AssetStatus;
  supportStatus?: string;
  description?: string;
  image?: string;
  createdAt: Date;
  updatedAt: Date;
}

const schema = new Schema<AssetDoc>(
  {
    assetCode: { type: String, required: true, unique: true, index: true },
    clientId: { type: Schema.Types.ObjectId, ref: "Client", required: true, index: true },
    orderId: { type: Schema.Types.ObjectId, ref: "Order" },
    orderItemId: String,
    name: { type: String, required: true, index: true },
    type: {
      type: String,
      enum: ["HARDWARE", "SOFTWARE", "WEBSITE", "SYSTEM", "LICENSE", "SERVICE"],
      required: true,
      index: true,
    },
    category: String,
    productId: { type: Schema.Types.ObjectId, ref: "Product" },
    manufacturer: String,
    model: String,
    serialNumber: { type: String, index: true },
    version: String,
    websiteUrl: String,
    systemUrl: String,
    licenseKeyMasked: String,
    licenseStartDate: Date,
    licenseEndDate: Date,
    installationDate: Date,
    warrantyStartDate: Date,
    warrantyEndDate: Date,
    serviceStartDate: Date,
    serviceEndDate: Date,
    location: String,
    department: String,
    assignedContact: String,
    environment: String,
    status: {
      type: String,
      enum: [
        "ORDERED",
        "PREPARING",
        "DELIVERY_PENDING",
        "INSTALLATION_PENDING",
        "INSTALLATION_SCHEDULED",
        "INSTALLING",
        "INSTALLED",
        "ACTIVE",
        "MAINTENANCE",
        "HAS_ISSUE",
        "SUSPENDED",
        "EXPIRED",
        "RETIRED",
      ],
      default: "ORDERED",
      index: true,
    },
    supportStatus: String,
    description: String,
    image: String,
  },
  { timestamps: true }
);

schema.index({ name: "text", serialNumber: "text", assetCode: "text" });

export const Asset = mongoose.model<AssetDoc>("Asset", schema);
