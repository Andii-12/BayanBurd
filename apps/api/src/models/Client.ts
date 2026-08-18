import mongoose, { Schema, Document } from "mongoose";

export interface ClientDoc extends Document {
  companyName: string;
  registrationNumber: string;
  address?: string;
  contactName: string;
  email: string;
  phone: string;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const schema = new Schema<ClientDoc>(
  {
    companyName: { type: String, required: true, index: true },
    registrationNumber: { type: String, required: true, unique: true },
    address: String,
    contactName: { type: String, required: true },
    email: { type: String, required: true, lowercase: true },
    phone: { type: String, required: true },
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const Client = mongoose.model<ClientDoc>("Client", schema);
