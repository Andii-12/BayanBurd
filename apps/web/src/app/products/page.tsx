"use client";

import { AppFooter, AppHeader } from "@/components/public-shell";
import { ProductCard } from "@/components/product-card";
import { ProductGridSkeleton } from "@/components/ui/skeleton";
import { ErrorState } from "@/components/ui/empty";
import { Input, Select } from "@/components/ui/input";
import { api } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";
import { useSearchParams, useRouter } from "next/navigation";
import { Suspense, useState } from "react";

function CatalogInner() {
  const sp = useSearchParams();
  const router = useRouter();
  const [search, setSearch] = useState(sp.get("search") || "");
  const productType = sp.get("productType") || "";
  const categoryId = sp.get("categoryId") || "";
  const brandId = sp.get("brandId") || "";
  const inStock = sp.get("inStock") || "";

  const cats = useQuery({ queryKey: ["categories"], queryFn: () => api("/api/categories") });
  const brands = useQuery({ queryKey: ["brands"], queryFn: () => api("/api/brands") });
  const products = useQuery({
    queryKey: ["products", productType, categoryId, brandId, inStock, search],
    queryFn: () => {
      const q = new URLSearchParams();
      if (productType) q.set("productType", productType);
      if (categoryId) q.set("categoryId", categoryId);
      if (brandId) q.set("brandId", brandId);
      if (inStock) q.set("inStock", inStock);
      if (search) q.set("search", search);
      q.set("limit", "24");
      return api(`/api/products?${q}`);
    },
  });

  function setParam(key: string, value: string) {
    const next = new URLSearchParams(sp.toString());
    if (value) next.set(key, value);
    else next.delete(key);
    router.push(`/products?${next}`);
  }

  return (
    <div className="min-h-screen">
      <AppHeader />
      <div className="mx-auto grid max-w-7xl gap-6 px-4 py-8 lg:grid-cols-[240px_1fr]">
        <aside className="card h-fit space-y-4 p-4">
          <h2 className="text-sm font-semibold">Шүүлтүүр</h2>
          <div>
            <div className="mb-1 text-[12px] text-[#6B7280]">Ангилал</div>
            <Select value={categoryId} onChange={(e) => setParam("categoryId", e.target.value)}>
              <option value="">Бүгд</option>
              {(cats.data?.items || []).map((c: any) => (
                <option key={c._id} value={c._id}>
                  {c.name}
                </option>
              ))}
            </Select>
          </div>
          <div>
            <div className="mb-1 text-[12px] text-[#6B7280]">Брэнд</div>
            <Select value={brandId} onChange={(e) => setParam("brandId", e.target.value)}>
              <option value="">Бүгд</option>
              {(brands.data?.items || []).map((b: any) => (
                <option key={b._id} value={b._id}>
                  {b.name}
                </option>
              ))}
            </Select>
          </div>
          <div>
            <div className="mb-1 text-[12px] text-[#6B7280]">Product type</div>
            <Select value={productType} onChange={(e) => setParam("productType", e.target.value)}>
              <option value="">Бүгд</option>
              <option value="HARDWARE">Тоног төхөөрөмж</option>
              <option value="SOFTWARE">Программ</option>
              <option value="SYSTEM">Систем</option>
              <option value="SERVICE">Үйлчилгээ</option>
              <option value="LICENSE">Лиценз</option>
            </Select>
          </div>
          <div>
            <div className="mb-1 text-[12px] text-[#6B7280]">Бэлэн байгаа эсэх</div>
            <Select value={inStock} onChange={(e) => setParam("inStock", e.target.value)}>
              <option value="">Бүгд</option>
              <option value="true">Бэлэн</option>
            </Select>
          </div>
        </aside>
        <div>
          <div className="mb-4 flex gap-2">
            <Input
              placeholder="Бүтээгдэхүүн хайх..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && setParam("search", search)}
            />
          </div>
          {products.isLoading && <ProductGridSkeleton />}
          {products.isError && <ErrorState onRetry={() => products.refetch()} />}
          {products.data && (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {products.data.items.map((p: any) => (
                <ProductCard key={p._id} product={p} />
              ))}
            </div>
          )}
        </div>
      </div>
      <AppFooter />
    </div>
  );
}

export default function ProductsPage() {
  return (
    <Suspense>
      <CatalogInner />
    </Suspense>
  );
}
