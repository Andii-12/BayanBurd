"use client";

import { api } from "@/lib/api";
import { daysRemaining, formatDate, nameOf } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";

export default function LicensesPage() {
  const { data } = useQuery({ queryKey: ["licenses"], queryFn: () => api("/api/assets?type=LICENSE&limit=100") });
  return (
    <div>
      <h1 className="text-xl font-semibold">Лиценз</h1>
      <div className="card mt-4 overflow-x-auto p-0">
        <table className="w-full text-sm">
          <thead className="bg-[#F7F8F6] text-left text-[12px] text-[#6B7280]">
            <tr>
              <th className="px-4 py-3">Лиценз</th>
              <th>Харилцагч</th>
              <th>Дуусах</th>
              <th>Үлдсэн</th>
            </tr>
          </thead>
          <tbody>
            {(data?.items || []).map((a: any) => (
              <tr key={a._id} className="border-t border-[#E5E7EB]">
                <td className="px-4 py-3"><Link className="text-primary" href={`/admin/assets/${a._id}`}>{a.name}</Link></td>
                <td>{nameOf(a.clientId)}</td>
                <td>{formatDate(a.licenseEndDate || a.serviceEndDate)}</td>
                <td>{daysRemaining(a.licenseEndDate || a.serviceEndDate)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
