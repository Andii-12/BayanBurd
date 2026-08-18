import mongoose, { Schema, Document } from "mongoose";

export interface BrandDoc extends Document {
  name: string;
  slug: string;
  logo?: string;
  active: boolean;
}

const schema = new Schema<BrandDoc>(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    logo: String,
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const Brand = mongoose.model<BrandDoc>("Brand", schema);
