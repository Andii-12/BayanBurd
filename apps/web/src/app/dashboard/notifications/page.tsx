"use client";

import { api } from "@/lib/api";
import { formatDate } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";

export default function NotificationsPage() {
  const { data } = useQuery({ queryKey: ["notifications"], queryFn: () => api("/api/notifications") });
  return (
    <div>
      <h1 className="text-xl font-semibold">Мэдэгдэл</h1>
      <div className="card mt-4 divide-y divide-[#E5E7EB] p-0">
        {(data?.items || []).map((n: any) => (
          <Link key={n._id} href={n.link || "#"} className="block px-4 py-3 text-sm hover:bg-[#F7F8F6]">
            <div className="font-medium">{n.title}</div>
            <div className="text-[#6B7280]">{n.message}</div>
            <div className="text-[12px] text-[#9CA3AF]">{formatDate(n.createdAt)}</div>
          </Link>
        ))}
      </div>
    </div>
  );
}
