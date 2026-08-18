"use client";

import { OrderStatusBadge } from "@/components/ui/badges";
import { api } from "@/lib/api";
import { formatDate, formatMnt, nameOf } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";

export default function AdminOrderDetail() {
  const { id } = useParams<{ id: string }>();
  const { data: o } = useQuery({ queryKey: ["order", id], queryFn: () => api(`/api/orders/${id}`) });
  if (!o) return null;
  return (
    <div>
      <h1 className="text-xl font-semibold">{o.orderNumber}</h1>
      <div className="mt-2"><OrderStatusBadge status={o.status} /></div>
      <div className="card mt-4 space-y-2 p-5 text-sm">
        <p>Харилцагч: {nameOf(o.clientId)}</p>
        <p>Огноо: {formatDate(o.createdAt)}</p>
        <p>Дүн: {formatMnt(o.total)}</p>
        <p>Төлбөр: {o.paymentMethod} / {o.paymentStatus}</p>
        <ul className="mt-3">
          {o.items?.map((i: any, n: number) => (
            <li key={n}>{i.name} × {i.quantity}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}
