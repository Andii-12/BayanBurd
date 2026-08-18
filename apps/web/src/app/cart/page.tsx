"use client";

import { AppFooter, AppHeader } from "@/components/public-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCart } from "@/lib/cart";
import { formatMnt } from "@/lib/utils";
import Link from "next/link";

export default function CartPage() {
  const cart = useCart();
  const subtotal = cart.items.reduce((s, i) => s + i.price * i.quantity, 0);
  return (
    <div>
      <AppHeader />
      <div className="mx-auto max-w-4xl px-4 py-10">
        <h1 className="text-2xl font-semibold">Сагс</h1>
        {cart.items.length === 0 ? (
          <p className="mt-6 text-sm text-[#6B7280]">Сагс хоосон байна.</p>
        ) : (
          <div className="card mt-6 overflow-x-auto p-0">
            <table className="w-full text-sm">
              <thead className="bg-[#F7F8F6] text-left text-[12px] text-[#6B7280]">
                <tr>
                  <th className="px-4 py-3">Бүтээгдэхүүн</th>
                  <th>Тоо</th>
                  <th>Үнэ</th>
                  <th>Суурилуулалт</th>
                  <th>Дүн</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {cart.items.map((i) => (
                  <tr key={i.productId} className="border-t border-[#E5E7EB]">
                    <td className="px-4 py-3">{i.name}</td>
                    <td>
                      <Input
                        type="number"
                        className="h-8 w-16"
                        value={i.quantity}
                        onChange={(e) => cart.update(i.productId, { quantity: Number(e.target.value) })}
                      />
                    </td>
                    <td>{i.quotationOnly ? "—" : formatMnt(i.price)}</td>
                    <td>
                      <input
                        type="checkbox"
                        checked={i.installation}
                        onChange={(e) => cart.update(i.productId, { installation: e.target.checked })}
                      />
                    </td>
                    <td>{formatMnt(i.price * i.quantity)}</td>
                    <td>
                      <button className="pr-4 text-danger" onClick={() => cart.remove(i.productId)}>
                        Устгах
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="flex items-center justify-between px-4 py-4">
              <div className="font-semibold">Нийт: {formatMnt(subtotal)}</div>
              <Link href="/checkout">
                <Button>Checkout</Button>
              </Link>
            </div>
          </div>
        )}
      </div>
      <AppFooter />
    </div>
  );
}
