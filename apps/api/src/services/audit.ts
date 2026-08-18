import { AuditLog } from "../models";

export async function audit(params: {
  userId?: string;
  action: string;
  entity: string;
  entityId?: string;
  metadata?: Record<string, unknown>;
}) {
  await AuditLog.create(params);
}
