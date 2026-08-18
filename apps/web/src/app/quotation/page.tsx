"use client";

import { AppFooter, AppHeader } from "@/components/public-shell";
import { Button } from "@/components/ui/button";
import { Field, Input, Textarea, Select } from "@/components/ui/input";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { useQuery } from "@tanstack/react-query";
import { useSearchParams } from "next/navigation";
import { Suspense, useMemo, useState } from "react";
import { toast } from "sonner";

function Inner() {
  const { client, user } = useAuth();
  const sp = useSearchParams();
  const products = useQuery({ queryKey: ["products-all"], queryFn: () => api("/api/products?limit=100") });
  const pre = sp.get("product");
  const [form, setForm] = useState({
    companyName: client?.companyName || "",
    contactName: user ? `${user.firstName} ${user.lastName}` : "",
    email: user?.email || "",
    phone: user?.phone || "",
    requirements: "",
  });
  const [items, setItems] = useState<{ productId: string; name: string; quantity: number }[]>(
    pre ? [{ productId: pre, name: "", quantity: 1 }] : [{ productId: "", name: "", quantity: 1 }]
  );

  const list = products.data?.items || [];
  const named = useMemo(
    () =>
      items.map((it) => ({
        ...it,
        name: it.name || list.find((p: any) => p._id === it.productId)?.name || "Бүтээгдэхүүн",
      })),
    [items, list]
  );

  return (
    <div>
      <AppHeader />
      <div className="mx-auto max-w-3xl px-4 py-10">
        <h1 className="text-2xl font-semibold">Үнийн санал авах</h1>
        <p className="mt-1 text-sm text-[#6B7280]">Олон бүтээгдэхүүн, үйлчилгээг нэг хүсэлтээр илгээнэ үү.</p>
        <form
          className="card mt-6 space-y-4 p-5"
          onSubmit={async (e) => {
            e.preventDefault();
            await api("/api/quotations", {
              method: "POST",
              body: JSON.stringify({ ...form, items: named.filter((i) => i.productId || i.name) }),
            });
            toast.success("Үнийн санал илгээгдлээ");
          }}
        >
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Компани"><Input value={form.companyName} onChange={(e) => setForm({ ...form, companyName: e.target.value })} required /></Field>
            <Field label="Холбоо барих хүн"><Input value={form.contactName} onChange={(e) => setForm({ ...form, contactName: e.target.value })} required /></Field>
            <Field label="Имэйл"><Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required /></Field>
            <Field label="Утас"><Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} required /></Field>
          </div>
          <div>
            <div className="mb-2 text-sm font-medium">Бүтээгдэхүүн</div>
            {named.map((it, idx) => (
              <div key={idx} className="mb-2 grid grid-cols-[1fr_100px] gap-2">
                <Select
                  value={it.productId}
                  onChange={(e) => {
                    const next = [...items];
                    next[idx] = { ...next[idx], productId: e.target.value };
                    setItems(next);
                  }}
                >
                  <option value="">Сонгох</option>
                  {list.map((p: any) => (
                    <option key={p._id} value={p._id}>{p.name}</option>
                  ))}
                </Select>
                <Input
                  type="number"
                  min={1}
                  value={it.quantity}
                  onChange={(e) => {
                    const next = [...items];
                    next[idx] = { ...next[idx], quantity: Number(e.target.value) };
                    setItems(next);
                  }}
                />
              </div>
            ))}
            <Button type="button" variant="outline" size="sm" onClick={() => setItems([...items, { productId: "", name: "", quantity: 1 }])}>
              Мөр нэмэх
            </Button>
          </div>
          <Field label="Шаардлага">
            <Textarea value={form.requirements} onChange={(e) => setForm({ ...form, requirements: e.target.value })} />
          </Field>
          <Button>Илгээх</Button>
        </form>
      </div>
      <AppFooter />
    </div>
  );
}

export default function QuotationPage() {
  return (
    <Suspense>
      <Inner />
    </Suspense>
  );
}
