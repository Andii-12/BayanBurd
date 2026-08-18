"use client";

import { AssetCard } from "@/components/asset-card";
import { api } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";

export default function DevicesPage() {
  const { data } = useQuery({
    queryKey: ["devices"],
    queryFn: () => api("/api/assets?type=HARDWARE&limit=50"),
  });
  return (
    <div>
      <h1 className="text-xl font-semibold">Миний төхөөрөмж</h1>
      <div className="mt-5 grid gap-4 md:grid-cols-2">
        {(data?.items || []).map((a: any) => (
          <AssetCard key={a._id} asset={a} href={`/dashboard/assets/${a._id}`} />
        ))}
      </div>
    </div>
  );
}
