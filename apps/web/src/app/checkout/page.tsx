"use client";

import { AppFooter, AppHeader } from "@/components/public-shell";
import { Button } from "@/components/ui/button";
import { Field, Input, Select, Textarea } from "@/components/ui/input";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { useCart } from "@/lib/cart";
import { formatMnt } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

export default function CheckoutPage() {
  const { user, client } = useAuth();
  const cart = useCart();
  const router = useRouter();
  const [form, setForm] = useState({
    contactName: user ? `${user.firstName} ${user.lastName}` : client?.contactName || "",
    phone: user?.phone || client?.phone || "",
    email: user?.email || client?.email || "",
    billingAddress: client?.address || "",
    deliveryLocation: "",
    notes: "",
    paymentMethod: "INVOICE",
  });

  if (!user) {
    return (
      <div>
        <AppHeader />
        <div className="mx-auto max-w-lg px-4 py-16 text-center">
          <p>Захиалга хийхийн тулд нэвтэрнэ үү.</p>
          <Button className="mt-4" onClick={() => router.push("/login")}>Нэвтрэх</Button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <AppHeader />
      <div className="mx-auto max-w-3xl px-4 py-10">
        <h1 className="text-2xl font-semibold">Захиалга баталгаажуулах</h1>
        <form
          className="card mt-6 space-y-3 p-5"
          onSubmit={async (e) => {
            e.preventDefault();
            const order = await api("/api/orders", {
              method: "POST",
              body: JSON.stringify({
                ...form,
                items: cart.items.map((i) => ({
                  productId: i.productId,
                  quantity: i.quantity,
                  installation: i.installation,
                })),
              }),
            });
            cart.clear();
            toast.success("Захиалга үүслээ");
            router.push(`/dashboard/orders/${order._id}`);
          }}
        >
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Компани"><Input value={client?.companyName || ""} disabled /></Field>
            <Field label="Холбоо барих"><Input value={form.contactName} onChange={(e) => setForm({ ...form, contactName: e.target.value })} /></Field>
            <Field label="Утас"><Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></Field>
            <Field label="Имэйл"><Input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></Field>
            <Field label="Нэхэмжлэхийн хаяг"><Input value={form.billingAddress} onChange={(e) => setForm({ ...form, billingAddress: e.target.value })} /></Field>
            <Field label="Хүргэлтийн байршил"><Input value={form.deliveryLocation} onChange={(e) => setForm({ ...form, deliveryLocation: e.target.value })} /></Field>
          </div>
          <Field label="Төлбөр">
            <Select value={form.paymentMethod} onChange={(e) => setForm({ ...form, paymentMethod: e.target.value })}>
              <option value="INVOICE">Нэхэмжлэх</option>
              <option value="BANK_TRANSFER">Банкны шилжүүлэг</option>
              <option value="MANUAL">Гараар баталгаажуулах</option>
            </Select>
          </Field>
          <Field label="Тэмдэглэл"><Textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} /></Field>
          <div className="text-sm text-[#6B7280]">
            {cart.items.map((i) => (
              <div key={i.productId}>{i.name} × {i.quantity} — {formatMnt(i.price * i.quantity)}</div>
            ))}
          </div>
          <Button>Захиалга илгээх</Button>
        </form>
      </div>
      <AppFooter />
    </div>
  );
}
