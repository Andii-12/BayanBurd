"use client";

import { Button } from "@/components/ui/button";
import { Field, Input, Select } from "@/components/ui/input";
import { api } from "@/lib/api";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";

export default function CategoriesPage() {
  const qc = useQueryClient();
  const { data } = useQuery({ queryKey: ["categories"], queryFn: () => api("/api/categories") });
  const brands = useQuery({ queryKey: ["brands"], queryFn: () => api("/api/brands") });
  const [cat, setCat] = useState({ name: "", productType: "HARDWARE" });
  const [brand, setBrand] = useState({ name: "" });
  const addCat = useMutation({
    mutationFn: () => api("/api/categories", { method: "POST", body: JSON.stringify(cat) }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["categories"] }); toast.success("Нэмэгдлээ"); },
  });
  const addBrand = useMutation({
    mutationFn: () => api("/api/brands", { method: "POST", body: JSON.stringify(brand) }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["brands"] }); toast.success("Нэмэгдлээ"); },
  });
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div>
        <h1 className="text-xl font-semibold">Ангилал</h1>
        <form className="card mt-4 space-y-2 p-4" onSubmit={(e) => { e.preventDefault(); addCat.mutate(); }}>
          <Field label="Нэр"><Input value={cat.name} onChange={(e) => setCat({ ...cat, name: e.target.value })} /></Field>
          <Select value={cat.productType} onChange={(e) => setCat({ ...cat, productType: e.target.value })}>
            <option>HARDWARE</option><option>SOFTWARE</option><option>SYSTEM</option><option>LICENSE</option><option>SERVICE</option>
          </Select>
          <Button>Нэмэх</Button>
        </form>
        <ul className="card mt-3 divide-y p-0 text-sm">
          {(data?.items || []).map((c: any) => <li key={c._id} className="px-4 py-2">{c.name} · {c.productType}</li>)}
        </ul>
      </div>
      <div>
        <h2 className="text-xl font-semibold">Брэнд</h2>
        <form className="card mt-4 space-y-2 p-4" onSubmit={(e) => { e.preventDefault(); addBrand.mutate(); }}>
          <Field label="Нэр"><Input value={brand.name} onChange={(e) => setBrand({ name: e.target.value })} /></Field>
          <Button>Нэмэх</Button>
        </form>
        <ul className="card mt-3 divide-y p-0 text-sm">
          {(brands.data?.items || []).map((b: any) => <li key={b._id} className="px-4 py-2">{b.name}</li>)}
        </ul>
      </div>
    </div>
  );
}
