"use client";

import { OrderStatusBadge } from "@/components/ui/badges";
import { api } from "@/lib/api";
import { formatDate, formatMnt } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";

export default function OrdersPage() {
  const { data } = useQuery({ queryKey: ["orders"], queryFn: () => api("/api/orders") });
  return (
    <div>
      <h1 className="text-xl font-semibold">Захиалгууд</h1>
      <div className="card mt-4 overflow-x-auto p-0">
        <table className="w-full text-sm">
          <thead className="bg-[#F7F8F6] text-left text-[12px] text-[#6B7280]">
            <tr>
              <th className="px-4 py-3">Дугаар</th>
              <th>Огноо</th>
              <th>Дүн</th>
              <th>Төлөв</th>
            </tr>
          </thead>
          <tbody>
            {(data?.items || []).map((o: any) => (
              <tr key={o._id} className="border-t border-[#E5E7EB]">
                <td className="px-4 py-3">
                  <Link href={`/dashboard/orders/${o._id}`} className="text-primary">{o.orderNumber}</Link>
                </td>
                <td>{formatDate(o.createdAt)}</td>
                <td>{formatMnt(o.total)}</td>
                <td><OrderStatusBadge status={o.status} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
