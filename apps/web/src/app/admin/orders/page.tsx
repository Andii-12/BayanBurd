"use client";

import { OrderStatusBadge } from "@/components/ui/badges";
import { Select } from "@/components/ui/input";
import { api } from "@/lib/api";
import { formatDate, formatMnt, nameOf } from "@/lib/utils";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { toast } from "sonner";

const statuses = ["PENDING", "CONFIRMED", "PROCESSING", "READY", "DELIVERING", "DELIVERED", "INSTALLATION_PENDING", "COMPLETED", "CANCELLED"];

export default function AdminOrders() {
  const qc = useQueryClient();
  const { data } = useQuery({ queryKey: ["admin-orders"], queryFn: () => api("/api/orders") });
  const mut = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      api(`/api/orders/${id}/status`, { method: "PATCH", body: JSON.stringify({ status }) }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-orders"] });
      toast.success("Төлөв шинэчлэгдлээ");
    },
  });
  return (
    <div>
      <h1 className="text-xl font-semibold">Захиалгууд</h1>
      <div className="card mt-4 overflow-x-auto p-0">
        <table className="w-full text-sm">
          <thead className="bg-[#F7F8F6] text-left text-[12px] text-[#6B7280]">
            <tr>
              <th className="px-4 py-3">Дугаар</th>
              <th>Харилцагч</th>
              <th>Огноо</th>
              <th>Дүн</th>
              <th>Төлөв</th>
              <th>Өөрчлөх</th>
            </tr>
          </thead>
          <tbody>
            {(data?.items || []).map((o: any) => (
              <tr key={o._id} className="border-t border-[#E5E7EB]">
                <td className="px-4 py-3">
                  <Link className="text-primary" href={`/admin/orders/${o._id}`}>{o.orderNumber}</Link>
                </td>
                <td>{nameOf(o.clientId)}</td>
                <td>{formatDate(o.createdAt)}</td>
                <td>{formatMnt(o.total)}</td>
                <td><OrderStatusBadge status={o.status} /></td>
                <td className="pr-3">
                  <Select className="h-8 w-44" value={o.status} onChange={(e) => mut.mutate({ id: o._id, status: e.target.value })}>
                    {statuses.map((s) => <option key={s}>{s}</option>)}
                  </Select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
