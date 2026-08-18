"use client";

import { api } from "@/lib/api";
import { formatDate } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";

export default function ServiceHistoryPage() {
  const { data } = useQuery({ queryKey: ["svc"], queryFn: () => api("/api/service-history") });
  return (
    <div>
      <h1 className="text-xl font-semibold">Үйлчилгээний түүх</h1>
      <ol className="card mt-4 space-y-4 p-5">
        {(data?.items || []).map((h: any) => (
          <li key={h._id} className="border-b border-[#F3F4F6] pb-3 text-sm last:border-0">
            <div className="text-[#6B7280]">{formatDate(h.performedAt)}</div>
            <div className="font-medium">{h.title}</div>
            <div className="text-[#6B7280]">{h.assetId?.name}</div>
          </li>
        ))}
      </ol>
    </div>
  );
}
