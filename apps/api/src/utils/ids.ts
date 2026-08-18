import { Types } from "mongoose";

export function oid(id?: string | Types.ObjectId | null) {
  if (!id) return undefined;
  return new Types.ObjectId(String(id));
}

export function padNumber(n: number, width = 6) {
  return String(n).padStart(width, "0");
}
