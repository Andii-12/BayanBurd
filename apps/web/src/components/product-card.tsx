"use client";

import Link from "next/link";
import { Button } from "./ui/button";
import { formatMnt, productThumb } from "@/lib/utils";
import { useCart } from "@/lib/cart";
import { Heart, GitCompare } from "lucide-react";
import { PRODUCT_TYPE_MN, type ProductType } from "@bbe/types";
import { toast } from "sonner";

export function ProductCard({ product }: { product: any }) {
  const cart = useCart();
  const thumb = productThumb(product);
  return (
    <div className="card flex flex-col overflow-hidden transition hover:shadow-md">
      <div className="flex h-40 items-center justify-center bg-primary-light text-primary">
        {thumb ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={thumb} alt="" className="h-full w-full object-cover" />
        ) : (
          <span className="text-sm font-medium">{product.sku}</span>
        )}
      </div>
      <div className="flex flex-1 flex-col p-4">
        <div className="text-[11px] uppercase tracking-wide text-[#9CA3AF]">
          {PRODUCT_TYPE_MN[product.productType as ProductType] || product.productType}
        </div>
        <h3 className="mt-1 text-sm font-semibold">{product.name}</h3>
        <p className="mt-1 line-clamp-2 text-[13px] text-[#6B7280]">{product.shortDescription}</p>
        <div className="mt-3 text-sm font-semibold text-primary">
          {product.quotationOnly ? "Үнийн санал" : formatMnt(product.price)}
        </div>
        <div className="mt-1 text-[12px] text-[#6B7280]">
          {product.stock > 0 ? "Бэлэн байгаа" : "Захиалгаар"}
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          {product.quotationOnly ? (
            <Link href={`/quotation?product=${product._id}`}>
              <Button size="sm" variant="orange">
                Үнийн санал авах
              </Button>
            </Link>
          ) : (
            <Button
              size="sm"
              onClick={() => {
                cart.add({
                  productId: product._id,
                  name: product.name,
                  slug: product.slug,
                  price: product.price || 0,
                  quotationOnly: false,
                  installation: !!product.installationAvailable,
                });
                toast.success("Сагсанд нэмэгдлээ");
              }}
            >
              Сагсанд хийх
            </Button>
          )}
          <Link href={`/products/${product.slug}`}>
            <Button size="sm" variant="outline">
              Дэлгэрэнгүй
            </Button>
          </Link>
          <button className="rounded-lg p-2 text-[#9CA3AF] hover:text-primary" title="Дуртай">
            <Heart className="h-4 w-4" />
          </button>
          <button className="rounded-lg p-2 text-[#9CA3AF] hover:text-primary" title="Харьцуулах">
            <GitCompare className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
