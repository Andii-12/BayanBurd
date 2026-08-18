"use client";

import { AppFooter, AppHeader } from "@/components/public-shell";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";
import { useCart } from "@/lib/cart";
import { formatMnt } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

const tabs = ["Тайлбар", "Үзүүлэлт", "Суурилуулалт", "Баталгаа", "Баримт бичиг"];

export default function ProductDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const { data: p, isLoading } = useQuery({
    queryKey: ["product", slug],
    queryFn: () => api(`/api/products/${slug}`),
  });
  const cart = useCart();
  const [tab, setTab] = useState("Тайлбар");
  if (isLoading) return <div className="p-10">Ачааллаж байна...</div>;
  if (!p) return null;
  const software = ["SOFTWARE", "SYSTEM", "LICENSE"].includes(p.productType);

  return (
    <div>
      <AppHeader />
      <div className="mx-auto max-w-7xl px-4 py-8">
        <div className="grid gap-8 lg:grid-cols-2">
          <div className="card flex h-80 items-center justify-center bg-primary-light text-primary">
            {p.images?.[0] ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={p.images[0]} alt="" className="h-full w-full object-cover" />
            ) : (
              <span className="text-lg font-medium">{p.sku}</span>
            )}
          </div>
          <div>
            <div className="text-[12px] text-[#6B7280]">{p.brandId?.name} · {p.categoryId?.name}</div>
            <h1 className="mt-1 text-2xl font-semibold">{p.name}</h1>
            <div className="mt-3 text-xl font-semibold text-primary">
              {p.quotationOnly ? "Үнийн санал авах" : formatMnt(p.price)}
            </div>
            <p className="mt-2 text-sm text-[#6B7280]">{p.stock > 0 ? "Бэлэн байгаа" : "Захиалгаар"}</p>
            <p className="mt-4 text-sm leading-relaxed text-[#374151]">{p.shortDescription}</p>
            {software && (
              <dl className="mt-4 grid grid-cols-2 gap-2 text-sm">
                {p.developmentTime && <><dt className="text-[#6B7280]">Хугацаа</dt><dd>{p.developmentTime}</dd></>}
                <dt className="text-[#6B7280]">Support</dt><dd>{p.supportMonths} сар</dd>
                {p.hostingOptional && <><dt className="text-[#6B7280]">Hosting</dt><dd>Optional</dd></>}
                {p.domainOptional && <><dt className="text-[#6B7280]">Domain</dt><dd>Optional</dd></>}
                {p.maintenanceOptional && <><dt className="text-[#6B7280]">Maintenance</dt><dd>Optional</dd></>}
              </dl>
            )}
            <div className="mt-6 flex gap-2">
              {!p.quotationOnly && (
                <Button
                  onClick={() => {
                    cart.add({
                      productId: p._id,
                      name: p.name,
                      slug: p.slug,
                      price: p.price || 0,
                      quotationOnly: false,
                      installation: !!p.installationAvailable,
                    });
                    toast.success("Сагсанд нэмэгдлээ");
                  }}
                >
                  Сагсанд хийх
                </Button>
              )}
              <Link href={`/quotation?product=${p._id}`}>
                <Button variant="orange">Үнийн санал авах</Button>
              </Link>
            </div>
          </div>
        </div>
        <div className="mt-8">
          <div className="flex gap-4 border-b border-[#E5E7EB] text-sm">
            {tabs.map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`-mb-px border-b-2 pb-2 ${tab === t ? "border-primary font-medium text-primary" : "border-transparent text-[#6B7280]"}`}
              >
                {t}
              </button>
            ))}
          </div>
          <div className="card mt-4 p-5 text-sm leading-relaxed">
            {tab === "Тайлбар" && (
              <div>
                <p>{p.description}</p>
                {p.includedFeatures?.length > 0 && (
                  <ul className="mt-4 list-disc pl-5">
                    {p.includedFeatures.map((f: string) => (
                      <li key={f}>{f}</li>
                    ))}
                  </ul>
                )}
                {p.technologies?.length > 0 && (
                  <p className="mt-3 text-[#6B7280]">Технологи: {p.technologies.join(", ")}</p>
                )}
              </div>
            )}
            {tab === "Үзүүлэлт" && (
              <table className="w-full text-sm">
                <tbody>
                  {Object.entries(p.specifications || {}).map(([k, v]) => (
                    <tr key={k} className="border-b border-[#F3F4F6]">
                      <td className="py-2 text-[#6B7280]">{k}</td>
                      <td className="py-2">{String(v)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
            {tab === "Суурилуулалт" && (
              <p>{p.installationAvailable ? "Суурилуулалт боломжтой. Захиалгын үед нэмж сонгоно уу." : "Суурилуулалт тусад нь тохиролцоно."}</p>
            )}
            {tab === "Баталгаа" && (
              <p>Баталгаа: {p.warrantyMonths} сар. Дэмжлэг: {p.supportMonths} сар.</p>
            )}
            {tab === "Баримт бичиг" && (
              <p>{p.documents?.length ? p.documents.map((d: any) => d.name).join(", ") : "Баримт бичиг удахгүй нэмэгдэнэ."}</p>
            )}
          </div>
        </div>
      </div>
      <AppFooter />
    </div>
  );
}
