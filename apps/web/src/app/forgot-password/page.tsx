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
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <form
        className="card w-full max-w-md p-6"
        onSubmit={async (e) => {
          e.preventDefault();
          await api("/api/auth/forgot-password", { method: "POST", body: JSON.stringify({ email }) });
          toast.success("Хэрэв имэйл бүртгэлтэй бол заавар илгээгдлээ.");
        }}
      >
        <Logo />
        <h1 className="mt-4 text-lg font-semibold">Нууц үг сэргээх</h1>
        <div className="mt-4">
          <Field label="Имэйл"><Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required /></Field>
        </div>
        <Button className="mt-5 w-full">Илгээх</Button>
        <Link href="/login" className="mt-3 block text-center text-sm text-primary">Буцах</Link>
      </form>
    </div>
  );
}
