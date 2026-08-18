"use client";

import { AssetCard } from "@/components/asset-card";
import { EmptyState, ErrorState } from "@/components/ui/empty";
import { TableSkeleton } from "@/components/ui/skeleton";
import { api } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";

const filters = [
  { v: "", l: "Бүгд" },
  { v: "HARDWARE", l: "Төхөөрөмж" },
  { v: "SOFTWARE", l: "Программ" },
  { v: "WEBSITE", l: "Веб сайт" },
  { v: "SYSTEM", l: "Систем" },
  { v: "LICENSE", l: "Лиценз" },
  { v: "SERVICE", l: "Үйлчилгээ" },
];

export default function AssetsPage() {
  const [type, setType] = useState("");
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["assets", type],
    queryFn: () => api(`/api/assets?limit=50${type ? `&type=${type}` : ""}`),
  });
  return (
    <div>
      <h1 className="text-xl font-semibold">Миний бүтээгдэхүүн</h1>
      <div className="mt-4 flex flex-wrap gap-2">
        {filters.map((f) => (
          <button
            key={f.v}
            onClick={() => setType(f.v)}
            className={`rounded-lg px-3 py-1.5 text-[13px] ${type === f.v ? "bg-primary text-white" : "bg-white border border-[#E5E7EB]"}`}
          >
            {f.l}
          </button>
        ))}
      </div>
      <div className="mt-5">
        {isLoading && <TableSkeleton />}
        {isError && <ErrorState onRetry={() => refetch()} />}
        {data?.items?.length === 0 && (
          <EmptyState title="Бүтээгдэхүүн алга" description="Захиалга хүргэгдсэний дараа энд харагдана." actionHref="/products" actionLabel="Каталог" />
        )}
        <div className="grid gap-4 md:grid-cols-2">
          {(data?.items || []).map((a: any) => (
            <AssetCard key={a._id} asset={a} href={`/dashboard/assets/${a._id}`} />
          ))}
        </div>
      </div>
    </div>
  );
}
