"use client";

import { api } from "@/lib/api";
import { formatDate } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";

export default function AdminNotifications() {
  const { data } = useQuery({ queryKey: ["notifications"], queryFn: () => api("/api/notifications") });
  return (
    <div>
      <h1 className="text-xl font-semibold">Notifications</h1>
      <div className="card mt-4 divide-y p-0 text-sm">
        {(data?.items || []).map((n: any) => (
          <div key={n._id} className="px-4 py-3">
            <div className="font-medium">{n.title}</div>
            <div className="text-[#6B7280]">{n.message}</div>
            <div className="text-[12px]">{formatDate(n.createdAt)}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
