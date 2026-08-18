"use client";

import { api } from "@/lib/api";
import { daysRemaining, formatDate } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";

export default function WarrantyPage() {
  const { data } = useQuery({ queryKey: ["assets-w"], queryFn: () => api("/api/assets?limit=100") });
  return (
    <div>
      <h1 className="text-xl font-semibold">Баталгаат хугацаа</h1>
      <div className="card mt-4 overflow-x-auto p-0">
        <table className="w-full text-sm">
          <thead className="bg-[#F7F8F6] text-left text-[12px] text-[#6B7280]">
            <tr>
              <th className="px-4 py-3">Төхөөрөмж / Систем</th>
              <th>Эхлэл</th>
              <th>Дуусах</th>
              <th>Үлдсэн хоног</th>
              <th>Төлөв</th>
            </tr>
          </thead>
          <tbody>
            {(data?.items || []).map((a: any) => {
              const end = a.warrantyEndDate || a.serviceEndDate || a.licenseEndDate;
              const days = daysRemaining(end);
              let warn = "";
              if (days != null && days < 0) warn = "Хугацаа дууссан";
              else if (days != null && days <= 7) warn = "7 хоног үлдсэн";
              else if (days != null && days <= 30) warn = "30 хоног үлдсэн";
              return (
                <tr key={a._id} className="border-t border-[#E5E7EB]">
                  <td className="px-4 py-3">
                    <Link href={`/dashboard/assets/${a._id}`} className="text-primary">{a.name}</Link>
                  </td>
                  <td>{formatDate(a.warrantyStartDate || a.serviceStartDate || a.licenseStartDate)}</td>
                  <td>{formatDate(end)}</td>
                  <td>{days ?? "—"}</td>
                  <td className={days != null && days <= 30 ? "text-orange-dark" : ""}>{warn || "Хэвийн"}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
