"use client";

import { AssetCard } from "@/components/asset-card";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";

export default function SystemsPage() {
  const { data } = useQuery({
    queryKey: ["systems"],
    queryFn: () => api("/api/assets?limit=50"),
  });
  const items = (data?.items || []).filter((a: any) =>
    ["SOFTWARE", "WEBSITE", "SYSTEM", "LICENSE"].includes(a.type)
  );
  return (
    <div>
      <h1 className="text-xl font-semibold">Миний систем</h1>
      <div className="mt-5 grid gap-4 md:grid-cols-2">
        {items.map((a: any) => (
          <div key={a._id}>
            <AssetCard asset={a} href={`/dashboard/assets/${a._id}`} />
            {(a.systemUrl || a.websiteUrl) && (
              <Link href={a.systemUrl || a.websiteUrl} target="_blank" className="mt-2 inline-block">
                <Button size="sm" variant="outline">Систем харах</Button>
              </Link>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
