"use client";

import { Input } from "@/components/ui/input";
import { api } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useState } from "react";

export default function ClientsPage() {
  const [search, setSearch] = useState("");
  const { data } = useQuery({
    queryKey: ["clients", search],
    queryFn: () => api(`/api/admin/clients?search=${encodeURIComponent(search)}`),
  });
  return (
    <div>
      <h1 className="text-xl font-semibold">Харилцагчид</h1>
      <Input className="mt-4 max-w-sm" placeholder="Хайх" value={search} onChange={(e) => setSearch(e.target.value)} />
      <div className="card mt-4 overflow-x-auto p-0">
        <table className="w-full text-sm">
          <thead className="bg-[#F7F8F6] text-left text-[12px] text-[#6B7280]">
            <tr>
              <th className="px-4 py-3">Компани</th>
              <th>Холбоо барих</th>
              <th>Утас</th>
              <th>Имэйл</th>
              <th>Assets</th>
              <th>Issues</th>
              <th>Orders</th>
              <th>Төлөв</th>
            </tr>
          </thead>
          <tbody>
            {(data?.items || []).map((c: any) => (
              <tr key={c._id} className="border-t border-[#E5E7EB]">
                <td className="px-4 py-3">
                  <Link className="text-primary" href={`/admin/clients/${c._id}`}>{c.companyName}</Link>
                </td>
                <td>{c.contactName}</td>
                <td>{c.phone}</td>
                <td>{c.email}</td>
                <td>{c.assetCount}</td>
                <td>{c.openIssueCount}</td>
                <td>{c.orderCount}</td>
                <td>{c.active ? "Идэвхтэй" : "Идэвхгүй"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
