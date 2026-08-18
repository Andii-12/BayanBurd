import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatMnt(n?: number | null) {
  if (n == null) return "—";
  return new Intl.NumberFormat("mn-MN").format(n) + "₮";
}

export function formatDate(d?: string | Date | null) {
  if (!d) return "—";
  const dt = new Date(d);
  if (Number.isNaN(dt.getTime())) return "—";
  return dt.toISOString().slice(0, 10);
}

export function daysRemaining(d?: string | Date | null) {
  if (!d) return null;
  const end = new Date(d).getTime();
  return Math.ceil((end - Date.now()) / 86400000);
}

export function idOf(v: unknown): string {
  if (!v) return "";
  if (typeof v === "string") return v;
  if (typeof v === "object" && v && "_id" in v) return String((v as { _id: string })._id);
  if (typeof v === "object" && v && "id" in v) return String((v as { id: string }).id);
  return String(v);
}

export function nameOf(v: unknown, fallback = "—") {
  if (!v || typeof v !== "object") return fallback;
  const o = v as Record<string, unknown>;
  return String(o.companyName || o.name || `${o.firstName || ""} ${o.lastName || ""}`.trim() || fallback);
}
