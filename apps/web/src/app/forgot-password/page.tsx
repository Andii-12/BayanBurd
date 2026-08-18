"use client";

import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/input";
import { Logo } from "@/components/logo";
import { useState } from "react";
import { toast } from "sonner";
import Link from "next/link";

export default function ForgotPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <form
        className="card w-full max-w-md p-6"
        onSubmit={async (e) => {
          e.preventDefault();
          setLoading(true);
          try {
            await api("/api/auth/forgot-password", { method: "POST", body: JSON.stringify({ email }) });
            setSent(true);
            toast.success("Имэйл илгээлээ. Хэрэв бүртгэлтэй бол холбоос ирнэ.");
          } catch (err: any) {
            toast.error(err.message || "Имэйл илгээхэд алдаа гарлаа");
          } finally {
            setLoading(false);
          }
        }}
      >
        <Logo />
        <h1 className="mt-4 text-lg font-semibold">Нууц үг сэргээх</h1>
        {sent ? (
          <p className="mt-4 text-sm leading-relaxed text-[#6B7280]">
            Хэрэв <b>{email}</b> бүртгэлтэй бол нууц үг сэргээх холбоос илгээлээ. Имэйлээ шалгана уу. Холбоос 1 цаг хүчинтэй.
          </p>
        ) : (
          <div className="mt-4">
            <Field label="Имэйл">
              <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </Field>
          </div>
        )}
        {!sent && (
          <Button className="mt-5 w-full" disabled={loading}>
            {loading ? "Илгээж байна..." : "Илгээх"}
          </Button>
        )}
        <Link href="/login" className="mt-3 block text-center text-sm text-primary">
          Буцах
        </Link>
      </form>
    </div>
  );
}
