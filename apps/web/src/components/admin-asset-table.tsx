"use client";

import { AssetStatusBadge, AssetTypeBadge } from "@/components/ui/badges";
import { Button } from "@/components/ui/button";
import { Input, Select } from "@/components/ui/input";
import { api } from "@/lib/api";
import { nameOf } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useState } from "react";

export function AdminAssetTable({ forcedType }: { forcedType?: string }) {
  const [type, setType] = useState(forcedType || "");
  const [status, setStatus] = useState("");
  const [search, setSearch] = useState("");
  const { data } = useQuery({
    queryKey: ["admin-assets", type, status, search],
    queryFn: () => {
      const q = new URLSearchParams({ limit: "50" });
      if (type) q.set("type", type);
      if (status) q.set("status", status);
      if (search) q.set("search", search);
      return api(`/api/assets?${q}`);
    },
  });
  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Assets</h1>
        <Link href="/admin/assets/new"><Button>Шинэ Asset</Button></Link>
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        {!forcedType && (
          <Select value={type} onChange={(e) => setType(e.target.value)}>
            <option value="">Төрөл</option>
            <option value="HARDWARE">HARDWARE</option>
            <option value="SOFTWARE">SOFTWARE</option>
            <option value="WEBSITE">WEBSITE</option>
            <option value="SYSTEM">SYSTEM</option>
            <option value="LICENSE">LICENSE</option>
            <option value="SERVICE">SERVICE</option>
          </Select>
        )}
        <Select value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="">Төлөв</option>
          <option>ACTIVE</option><option>HAS_ISSUE</option><option>INSTALLATION_PENDING</option><option>EXPIRED</option>
        </Select>
        <Input className="max-w-xs" placeholder="Хайх / serial" value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>
      <div className="card mt-4 overflow-x-auto p-0">
        <table className="w-full text-sm">
          <thead className="bg-[#F7F8F6] text-left text-[12px] text-[#6B7280]">
            <tr>
              <th className="px-4 py-3">Код</th>
              <th>Asset</th>
              <th>Харилцагч</th>
              <th>Төрөл</th>
              <th>Serial / Version</th>
              <th>Төлөв</th>
              <th>Issues</th>
            </tr>
          </thead>
          <tbody>
            {(data?.items || []).map((a: any) => (
              <tr key={a._id} className="border-t border-[#E5E7EB]">
                <td className="px-4 py-3">{a.assetCode}</td>
                <td><Link className="text-primary" href={`/admin/assets/${a._id}`}>{a.name}</Link></td>
                <td>{nameOf(a.clientId)}</td>
                <td><AssetTypeBadge type={a.type} /></td>
                <td>{a.serialNumber || a.version || "—"}</td>
                <td><AssetStatusBadge status={a.status} /></td>
                <td>
                  <Link href={`/admin/issues?assetId=${a._id}`} className="text-danger">{a.openIssueCount}</Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
