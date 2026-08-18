"use client";

import { api } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";

export default function DocumentsPage() {
  const { data } = useQuery({ queryKey: ["docs"], queryFn: () => api("/api/documents") });
  return (
    <div>
      <h1 className="text-xl font-semibold">Баримт бичиг</h1>
      <div className="card mt-4 divide-y divide-[#E5E7EB] p-0">
        {(data?.items || []).length === 0 && <p className="p-5 text-sm text-[#6B7280]">Баримт бичиг алга.</p>}
        {(data?.items || []).map((d: any) => (
          <a key={d._id} href={d.url} className="block px-4 py-3 text-sm hover:bg-[#F7F8F6]">
            {d.name} <span className="text-[#6B7280]">· {d.type}</span>
          </a>
        ))}
      </div>
    </div>
  );
}
