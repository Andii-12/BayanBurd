"use client";

import { AssetStatusBadge } from "@/components/ui/badges";
import { Button } from "@/components/ui/button";
import { Field, Select } from "@/components/ui/input";
import { api } from "@/lib/api";
import { ASSET_STATUS_MN, type AssetStatus } from "@bbe/types";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

export default function AdminAssetDetail() {
  const { id } = useParams<{ id: string }>();
  const { data: a, refetch } = useQuery({ queryKey: ["asset", id], queryFn: () => api(`/api/assets/${id}`) });
  const [status, setStatus] = useState("");
  if (!a) return null;
  return (
    <div>
      <h1 className="text-xl font-semibold">{a.name}</h1>
      <div className="mt-2"><AssetStatusBadge status={a.status} /></div>
      <div className="card mt-4 space-y-2 p-5 text-sm">
        <p>Код: {a.assetCode}</p>
        <p>Serial: {a.serialNumber || "—"}</p>
        <p>Version: {a.version || "—"}</p>
        <p>URL: {a.systemUrl || a.websiteUrl || "—"}</p>
        <form
          className="flex gap-2 pt-3"
          onSubmit={async (e) => {
            e.preventDefault();
            await api(`/api/assets/${id}`, { method: "PATCH", body: JSON.stringify({ status }) });
            toast.success("Төлөв шинэчлэгдлээ");
            refetch();
          }}
        >
          <Select value={status || a.status} onChange={(e) => setStatus(e.target.value)}>
            {Object.keys(ASSET_STATUS_MN).map((s) => (
              <option key={s} value={s}>{ASSET_STATUS_MN[s as AssetStatus]}</option>
            ))}
          </Select>
          <Button size="sm">Хадгалах</Button>
        </form>
        <Link href={`/admin/issues?assetId=${id}`} className="inline-block text-primary">Issues харах</Link>
      </div>
    </div>
  );
}
