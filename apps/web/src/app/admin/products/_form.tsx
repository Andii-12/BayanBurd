"use client";

import { Button } from "@/components/ui/button";
import { Field, Input, Select, Textarea } from "@/components/ui/input";
import { api } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export default function ProductForm({ isNew = false }: { isNew?: boolean }) {
  const params = useParams<{ id?: string }>();
  const router = useRouter();
  const cats = useQuery({ queryKey: ["categories"], queryFn: () => api("/api/categories") });
  const brands = useQuery({ queryKey: ["brands"], queryFn: () => api("/api/brands") });
  const existing = useQuery({
    queryKey: ["prod", params.id],
    queryFn: () => api(`/api/products/${params.id}`),
    enabled: !isNew && !!params.id,
  });
  const [form, setForm] = useState<any>({
    name: "",
    sku: "",
    productType: "HARDWARE",
    price: 0,
    stock: 0,
    quotationOnly: false,
    shortDescription: "",
    description: "",
    installationAvailable: false,
    warrantyMonths: 12,
    supportMonths: 12,
    active: true,
  });
  useEffect(() => {
    if (!isNew && existing.data?._id) {
      const p = existing.data;
      setForm({ ...p, categoryId: p.categoryId?._id || p.categoryId, brandId: p.brandId?._id || p.brandId });
    }
  }, [existing.data, isNew, params.id]);

  return (
    <form
      className="card max-w-2xl space-y-3 p-5"
      onSubmit={async (e) => {
        e.preventDefault();
        const payload = { ...form, price: Number(form.price), stock: Number(form.stock) };
        if (isNew) await api("/api/products", { method: "POST", body: JSON.stringify(payload) });
        else await api(`/api/products/${params.id}`, { method: "PATCH", body: JSON.stringify(payload) });
        toast.success("Хадгаллаа");
        router.push("/admin/products");
      }}
    >
      <h1 className="text-lg font-semibold">{isNew ? "Шинэ бүтээгдэхүүн" : "Засах"}</h1>
      <Field label="Нэр"><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required /></Field>
      <Field label="SKU"><Input value={form.sku} onChange={(e) => setForm({ ...form, sku: e.target.value })} required /></Field>
      <Field label="Төрөл">
        <Select value={form.productType} onChange={(e) => setForm({ ...form, productType: e.target.value })}>
          <option>HARDWARE</option><option>SOFTWARE</option><option>SYSTEM</option><option>SERVICE</option><option>LICENSE</option>
        </Select>
      </Field>
      <Field label="Ангилал">
        <Select value={form.categoryId || ""} onChange={(e) => setForm({ ...form, categoryId: e.target.value })}>
          <option value="">—</option>
          {(cats.data?.items || []).map((c: any) => <option key={c._id} value={c._id}>{c.name}</option>)}
        </Select>
      </Field>
      <Field label="Брэнд">
        <Select value={form.brandId || ""} onChange={(e) => setForm({ ...form, brandId: e.target.value })}>
          <option value="">—</option>
          {(brands.data?.items || []).map((b: any) => <option key={b._id} value={b._id}>{b.name}</option>)}
        </Select>
      </Field>
      <Field label="Үнэ"><Input type="number" value={form.price || 0} onChange={(e) => setForm({ ...form, price: e.target.value })} /></Field>
      <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={!!form.quotationOnly} onChange={(e) => setForm({ ...form, quotationOnly: e.target.checked })} /> Зөвхөн үнийн санал</label>
      <Field label="Нөөц"><Input type="number" value={form.stock || 0} onChange={(e) => setForm({ ...form, stock: e.target.value })} /></Field>
      <Field label="Товч"><Input value={form.shortDescription || ""} onChange={(e) => setForm({ ...form, shortDescription: e.target.value })} /></Field>
      <Field label="Тайлбар"><Textarea value={form.description || ""} onChange={(e) => setForm({ ...form, description: e.target.value })} /></Field>
      <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={!!form.installationAvailable} onChange={(e) => setForm({ ...form, installationAvailable: e.target.checked })} /> Суурилуулалт</label>
      <Button>Хадгалах</Button>
    </form>
  );
}
