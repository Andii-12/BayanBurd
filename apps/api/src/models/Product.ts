import mongoose, { Schema, Document, Types } from "mongoose";
import type { ProductType } from "@bbe/types";

export interface ProductDoc extends Document {
  name: string;
  slug: string;
  sku: string;
  productType: ProductType;
  categoryId?: Types.ObjectId;
  brandId?: Types.ObjectId;
  description?: string;
  shortDescription?: string;
  price?: number;
  quotationOnly: boolean;
  stock: number;
  specifications: Record<string, string>;
  images: string[];
  documents: { name: string; url: string }[];
  installationAvailable: boolean;
  warrantyMonths: number;
  supportMonths: number;
  developmentTime?: string;
  technologies: string[];
  includedFeatures: string[];
  hostingOptional: boolean;
  domainOptional: boolean;
  maintenanceOptional: boolean;
  active: boolean;
  archived: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const schema = new Schema<ProductDoc>(
  {
    name: { type: String, required: true, index: "text" },
    slug: { type: String, required: true, unique: true },
    sku: { type: String, required: true, unique: true },
    productType: {
      type: String,
      enum: ["HARDWARE", "SOFTWARE", "SYSTEM", "SERVICE", "LICENSE"],
      required: true,
      index: true,
    },
    categoryId: { type: Schema.Types.ObjectId, ref: "Category" },
    brandId: { type: Schema.Types.ObjectId, ref: "Brand" },
    description: String,
    shortDescription: String,
    price: Number,
    quotationOnly: { type: Boolean, default: false },
    stock: { type: Number, default: 0 },
    specifications: { type: Schema.Types.Mixed, default: {} },
    images: { type: [String], default: [] },
    documents: { type: [{ name: String, url: String }], default: [] },
    installationAvailable: { type: Boolean, default: false },
    warrantyMonths: { type: Number, default: 12 },
    supportMonths: { type: Number, default: 12 },
    developmentTime: String,
    technologies: { type: [String], default: [] },
    includedFeatures: { type: [String], default: [] },
    hostingOptional: { type: Boolean, default: false },
    domainOptional: { type: Boolean, default: false },
    maintenanceOptional: { type: Boolean, default: false },
    active: { type: Boolean, default: true },
    archived: { type: Boolean, default: false },
  },
  { timestamps: true }
);

schema.index({ name: "text", sku: "text", shortDescription: "text" });

export const Product = mongoose.model<ProductDoc>("Product", schema);
