import mongoose, { Schema, Document } from "mongoose";

export interface CategoryDoc extends Document {
  name: string;
  slug: string;
  productType: string;
  description?: string;
  active: boolean;
}

const schema = new Schema<CategoryDoc>(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    productType: { type: String, required: true, index: true },
    description: String,
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const Category = mongoose.model<CategoryDoc>("Category", schema);
