"use client";

import { api } from "@/lib/api";
import { formatDate, nameOf } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";

export default function AdminServiceHistory() {
  const { data } = useQuery({ queryKey: ["svc-admin"], queryFn: () => api("/api/service-history?limit=50") });
  return (
    <div>
      <h1 className="text-xl font-semibold">Service History</h1>
      <ol className="card mt-4 space-y-3 p-5 text-sm">
        {(data?.items || []).map((h: any) => (
          <li key={h._id} className="border-b border-[#F3F4F6] pb-3">
            <div className="text-[#6B7280]">{formatDate(h.performedAt)} · {nameOf(h.clientId)}</div>
            <div className="font-medium">{h.title}</div>
            <div>{h.assetId?.name}</div>
          </li>
        ))}
      </ol>
    </div>
  );
}
