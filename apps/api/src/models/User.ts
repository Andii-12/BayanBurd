import mongoose, { Schema, Document, Types } from "mongoose";
import type { UserRole } from "@bbe/types";

export interface UserDoc extends Document {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  passwordHash: string;
  role: UserRole;
  clientId?: Types.ObjectId;
  avatar?: string;
  active: boolean;
  passwordResetToken?: string;
  passwordResetExpires?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const schema = new Schema<UserDoc>(
  {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true, index: true },
    phone: { type: String, required: true },
    passwordHash: { type: String, required: true },
    role: {
      type: String,
      enum: ["CLIENT", "ADMIN", "SUPER_ADMIN", "ENGINEER", "SALES", "SUPPORT"],
      default: "CLIENT",
      index: true,
    },
    clientId: { type: Schema.Types.ObjectId, ref: "Client", index: true },
    avatar: String,
    active: { type: Boolean, default: true },
    passwordResetToken: String,
    passwordResetExpires: Date,
  },
  { timestamps: true }
);

export const User = mongoose.model<UserDoc>("User", schema);
