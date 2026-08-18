"use client";

import { InstallationStatusBadge } from "@/components/ui/badges";
import { api } from "@/lib/api";
import { formatDate } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";

export default function InstallationsPage() {
  const { data } = useQuery({ queryKey: ["installs"], queryFn: () => api("/api/installations") });
  return (
    <div>
      <h1 className="text-xl font-semibold">Суурилуулалт</h1>
      <div className="mt-4 grid gap-3">
        {(data?.items || []).map((i: any) => (
          <div key={i._id} className="card p-4 text-sm">
            <div className="flex justify-between">
              <div className="font-medium">{i.installationType}</div>
              <InstallationStatusBadge status={i.status} />
            </div>
            <p className="mt-2 text-[#6B7280]">{formatDate(i.scheduledDate)} {i.scheduledTime} · {i.location}</p>
            <p className="text-[#6B7280]">{i.assetId?.name}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
