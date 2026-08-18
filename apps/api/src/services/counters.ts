import { Counter } from "../models";
import { padNumber } from "../utils/ids";

export async function nextSeq(key: string) {
  const doc = await Counter.findOneAndUpdate(
    { key },
    { $inc: { seq: 1 } },
    { new: true, upsert: true }
  );
  return doc.seq as number;
}

export async function nextIssueNumber() {
  const n = await nextSeq("issue");
  return `BE-${padNumber(n)}`;
}

export async function nextOrderNumber() {
  const n = await nextSeq("order");
  return `ORD-${padNumber(n, 4)}`;
}

export async function nextAssetCode() {
  const n = await nextSeq("asset");
  return `AST-${padNumber(n)}`;
}

export async function nextQuotationNumber() {
  const n = await nextSeq("quotation");
  return `QT-${padNumber(n, 4)}`;
}
