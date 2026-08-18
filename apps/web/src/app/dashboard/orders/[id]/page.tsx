"use client";

import { OrderStatusBadge } from "@/components/ui/badges";
import { api } from "@/lib/api";
import { formatDate, formatMnt } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";

export default function OrderDetail() {
  const { id } = useParams<{ id: string }>();
  const { data: o } = useQuery({ queryKey: ["order", id], queryFn: () => api(`/api/orders/${id}`) });
  if (!o) return null;
  return (
    <div>
      <h1 className="text-xl font-semibold">{o.orderNumber}</h1>
      <div className="mt-2"><OrderStatusBadge status={o.status} /></div>
      <div className="card mt-4 p-5 text-sm">
        <p>Огноо: {formatDate(o.createdAt)}</p>
        <p>Дүн: {formatMnt(o.total)}</p>
        <p>Хүргэлт: {o.deliveryLocation || "—"}</p>
        <ul className="mt-4 space-y-1">
          {o.items?.map((i: any, idx: number) => (
            <li key={idx}>{i.name} × {i.quantity} {i.installation ? "(суурилуулалт)" : ""}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}
