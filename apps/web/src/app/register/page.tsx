"use client";

import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/input";
import { Logo } from "@/components/logo";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

export default function RegisterPage() {
  const router = useRouter();
  const { refresh } = useAuth();
  const [form, setForm] = useState({
    companyName: "",
    registrationNumber: "",
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
    address: "",
  });
  const [loading, setLoading] = useState(false);
  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-10">
      <form
        className="card w-full max-w-lg p-6"
        onSubmit={async (e) => {
          e.preventDefault();
          setLoading(true);
          try {
            const data = await api("/api/auth/register", { method: "POST", body: JSON.stringify(form) });
            localStorage.setItem("accessToken", data.accessToken);
            await refresh();
            toast.success("Бүртгэл амжилттай. Имэйл илгээлээ.");
            router.push("/dashboard");
          } catch (err: any) {
            toast.error(err.message);
          } finally {
            setLoading(false);
          }
        }}
      >
        <Logo />
        <h1 className="mt-4 text-lg font-semibold">Харилцагчийн бүртгэл</h1>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <Field label="Компанийн нэр"><Input value={form.companyName} onChange={(e) => set("companyName", e.target.value)} required /></Field>
          <Field label="Регистр"><Input value={form.registrationNumber} onChange={(e) => set("registrationNumber", e.target.value)} required /></Field>
          <Field label="Нэр"><Input value={form.firstName} onChange={(e) => set("firstName", e.target.value)} required /></Field>
          <Field label="Овог"><Input value={form.lastName} onChange={(e) => set("lastName", e.target.value)} required /></Field>
          <Field label="Имэйл"><Input type="email" value={form.email} onChange={(e) => set("email", e.target.value)} required /></Field>
          <Field label="Утас"><Input value={form.phone} onChange={(e) => set("phone", e.target.value)} required /></Field>
          <Field label="Нууц үг"><Input type="password" value={form.password} onChange={(e) => set("password", e.target.value)} required /></Field>
          <Field label="Хаяг (заавал биш)"><Input value={form.address} onChange={(e) => set("address", e.target.value)} /></Field>
        </div>
        <Button className="mt-5 w-full" disabled={loading}>{loading ? "..." : "Бүртгүүлэх"}</Button>
        <p className="mt-3 text-center text-sm text-[#6B7280]">
          Бүртгэлтэй юу? <Link href="/login" className="text-primary">Нэвтрэх</Link>
        </p>
      </form>
    </div>
  );
}
