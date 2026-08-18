"use client";

import { Button } from "@/components/ui/button";
import { Field, Input, Select, Textarea } from "@/components/ui/input";
import { ImagePicker } from "@/components/image-picker";
import { api } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { X } from "lucide-react";

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
    images: [] as string[],
    thumbnail: "",
  });
  const [thumbnailFile, setThumbnailFile] = useState<File[]>([]);
  const [galleryFiles, setGalleryFiles] = useState<File[]>([]);
  const [saving, setSaving] = useState(false);
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
        setSaving(true);
        try {
          const payload = {
            name: form.name,
            sku: form.sku,
            productType: form.productType,
            categoryId: form.categoryId || undefined,
            brandId: form.brandId || undefined,
            price: Number(form.price),
            stock: Number(form.stock),
            quotationOnly: !!form.quotationOnly,
            shortDescription: form.shortDescription,
            description: form.description,
            installationAvailable: !!form.installationAvailable,
            warrantyMonths: Number(form.warrantyMonths) || 0,
            supportMonths: Number(form.supportMonths) || 0,
            active: form.active !== false,
            images: form.images || [],
            thumbnail: form.thumbnail || "",
          };
          const saved = isNew
            ? await api("/api/products", { method: "POST", body: JSON.stringify(payload) })
            : await api(`/api/products/${params.id}`, { method: "PATCH", body: JSON.stringify(payload) });
          if (thumbnailFile.length || galleryFiles.length) {
            const fd = new FormData();
            if (thumbnailFile[0]) fd.append("thumbnail", thumbnailFile[0]);
            for (const file of galleryFiles) fd.append("files", file);
            await api(`/api/products/${saved._id}/images`, { method: "POST", body: fd });
          }
          toast.success("Хадгаллаа");
          router.push("/admin/products");
        } catch (err: any) {
          toast.error(err.message || "Хадгалахад алдаа гарлаа");
        } finally {
          setSaving(false);
        }
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
      <div className="space-y-5 border-t border-[#E5E7EB] pt-4">
        <div>
          {form.thumbnail && !thumbnailFile.length && (
            <div className="mb-2">
              <div className="mb-1.5 text-[13px] font-medium text-[#374151]">Одоогийн thumbnail</div>
              <div className="relative h-24 w-24 overflow-hidden rounded-lg border border-[#E5E7EB]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={form.thumbnail} alt="" className="h-full w-full object-cover" />
                <button
                  type="button"
                  className="absolute right-1 top-1 rounded-full bg-black/60 p-0.5 text-white"
                  onClick={() => setForm({ ...form, thumbnail: "" })}
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            </div>
          )}
          <ImagePicker
            files={thumbnailFile}
            onChange={setThumbnailFile}
            max={1}
            multiple={false}
            label="Thumbnail зураг"
            hint="Каталог, жагсаалтад харагдана · 1 файл"
          />
        </div>
        <div>
          {(form.images || []).length > 0 && (
            <div className="mb-2">
              <div className="mb-1.5 text-[13px] font-medium text-[#374151]">Одоогийн зураг</div>
              <div className="flex flex-wrap gap-2">
                {(form.images as string[]).map((url: string) => (
                  <div key={url} className="relative h-20 w-20 overflow-hidden rounded-lg border border-[#E5E7EB]">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={url} alt="" className="h-full w-full object-cover" />
                    <button
                      type="button"
                      className="absolute right-1 top-1 rounded-full bg-black/60 p-0.5 text-white"
                      onClick={() => setForm({ ...form, images: form.images.filter((u: string) => u !== url) })}
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
          <ImagePicker
            files={galleryFiles}
            onChange={setGalleryFiles}
            label="Бүтээгдэхүүний бусад зураг"
            hint="Дэлгэрэнгүй хуудсын gallery · хамгийн ихдээ 8 файл"
          />
        </div>
      </div>
      <Button disabled={saving}>{saving ? "Хадгалж байна..." : "Хадгалах"}</Button>
    </form>
  );
}
