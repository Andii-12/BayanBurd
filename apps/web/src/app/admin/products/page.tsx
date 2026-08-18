"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { api } from "@/lib/api";
import { formatMnt } from "@/lib/utils";
import { PRODUCT_TYPE_MN, type ProductType } from "@bbe/types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";

export default function AdminProducts() {
  const [search, setSearch] = useState("");
  const qc = useQueryClient();
  const { data } = useQuery({
    queryKey: ["admin-products", search],
    queryFn: () => api(`/api/products?search=${encodeURIComponent(search)}&limit=50&active=all`),
  });
  const del = useMutation({
    mutationFn: (id: string) => api(`/api/products/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-products"] });
      toast.success("Архивлалаа");
    },
  });
  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Бүтээгдэхүүн</h1>
        <Link href="/admin/products/new"><Button>Шинэ</Button></Link>
      </div>
      <Input className="mt-4 max-w-sm" placeholder="Хайх" value={search} onChange={(e) => setSearch(e.target.value)} />
      <div className="card mt-4 overflow-x-auto p-0">
        <table className="w-full text-sm">
          <thead className="bg-[#F7F8F6] text-left text-[12px] text-[#6B7280]">
            <tr>
              <th className="px-4 py-3">Нэр</th>
              <th>SKU</th>
              <th>Төрөл</th>
              <th>Үнэ</th>
              <th>Нөөц</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {(data?.items || []).map((p: any) => (
              <tr key={p._id} className="border-t border-[#E5E7EB]">
                <td className="px-4 py-3">
                  <Link href={`/admin/products/${p._id}`} className="text-primary">{p.name}</Link>
                </td>
                <td>{p.sku}</td>
                <td>{PRODUCT_TYPE_MN[p.productType as ProductType]}</td>
                <td>{p.quotationOnly ? "QT" : formatMnt(p.price)}</td>
                <td>{p.stock}</td>
                <td>
                  <button className="pr-3 text-danger" onClick={() => del.mutate(p._id)}>Устгах</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
