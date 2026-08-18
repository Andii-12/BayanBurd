"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Bell } from "lucide-react";
import { useState } from "react";
import Link from "next/link";
import { formatDate } from "@/lib/utils";
import { useAuth } from "@/lib/auth";

export function NotificationDropdown() {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const qc = useQueryClient();
  const { data } = useQuery({
    queryKey: ["notifications"],
    queryFn: () => api("/api/notifications"),
    enabled: !!user,
    refetchInterval: 30000,
  });
  const readAll = useMutation({
    mutationFn: () => api("/api/notifications/read-all", { method: "POST" }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["notifications"] }),
  });
  if (!user) return null;
  const unread = data?.unread || 0;
  return (
    <div className="relative">
      <button onClick={() => setOpen((v) => !v)} className="relative rounded-lg p-2 hover:bg-primary-light">
        <Bell className="h-5 w-5 text-[#374151]" />
        {unread > 0 && (
          <span className="absolute right-1 top-1 h-4 min-w-4 rounded-full bg-orange px-1 text-[10px] font-semibold text-white">
            {unread}
          </span>
        )}
      </button>
      {open && (
        <div className="card absolute right-0 z-40 mt-2 w-80 p-0">
          <div className="flex items-center justify-between border-b border-[#E5E7EB] px-3 py-2">
            <span className="text-sm font-medium">Мэдэгдэл</span>
            <button className="text-[12px] text-primary" onClick={() => readAll.mutate()}>
              Бүгдийг уншсан
            </button>
          </div>
          <div className="max-h-80 overflow-y-auto">
            {(data?.items || []).length === 0 && (
              <p className="px-3 py-6 text-center text-sm text-[#6B7280]">Мэдэгдэл байхгүй</p>
            )}
            {(data?.items || []).map((n: any) => (
              <Link
                key={n._id}
                href={n.link || "#"}
                onClick={() => setOpen(false)}
                className={`block border-b border-[#F3F4F6] px-3 py-2.5 text-sm hover:bg-[#F7F8F6] ${n.read ? "opacity-70" : ""}`}
              >
                <div className="font-medium">{n.title}</div>
                <div className="text-[12px] text-[#6B7280]">{n.message}</div>
                <div className="text-[11px] text-[#9CA3AF]">{formatDate(n.createdAt)}</div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
