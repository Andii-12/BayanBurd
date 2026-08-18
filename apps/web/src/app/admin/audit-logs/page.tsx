"use client";

import { api } from "@/lib/api";
import { formatDate, nameOf } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";

export default function AuditPage() {
  const { data, isError } = useQuery({ queryKey: ["audit"], queryFn: () => api("/api/admin/audit-logs") });
  return (
    <div>
      <h1 className="text-xl font-semibold">Audit Logs</h1>
      {isError && <p className="mt-4 text-sm text-[#6B7280]">Зөвхөн SUPER_ADMIN хандана.</p>}
      <div className="card mt-4 overflow-x-auto p-0">
        <table className="w-full text-sm">
          <thead className="bg-[#F7F8F6] text-left text-[12px] text-[#6B7280]">
            <tr>
              <th className="px-4 py-3">Огноо</th>
              <th>Хэрэглэгч</th>
              <th>Үйлдэл</th>
              <th>Entity</th>
            </tr>
          </thead>
          <tbody>
            {(data?.items || []).map((a: any) => (
              <tr key={a._id} className="border-t border-[#E5E7EB]">
                <td className="px-4 py-3">{formatDate(a.createdAt)}</td>
                <td>{nameOf(a.userId)}</td>
                <td>{a.action}</td>
                <td>{a.entity} {a.entityId}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
