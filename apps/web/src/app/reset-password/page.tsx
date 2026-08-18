"use client";

import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/input";
import { Logo } from "@/components/logo";
import { useSearchParams, useRouter } from "next/navigation";
import { Suspense, useState } from "react";
import { toast } from "sonner";
import Link from "next/link";

function Inner() {
  const sp = useSearchParams();
  const router = useRouter();
  const token = sp.get("token") || "";
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);

  if (!token) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-4">
        <div className="card w-full max-w-md p-6">
          <Logo />
          <h1 className="mt-4 text-lg font-semibold">Холбоос хүчингүй</h1>
          <p className="mt-2 text-sm text-[#6B7280]">Имэйл дэх холбоосоор орно уу.</p>
          <Link href="/forgot-password" className="mt-4 inline-block text-sm text-primary">
            Дахин хүсэлт илгээх
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <form
        className="card w-full max-w-md p-6"
        onSubmit={async (e) => {
          e.preventDefault();
          if (password.length < 8) {
            toast.error("Нууц үг хамгийн багадаа 8 тэмдэгт байх ёстой");
            return;
          }
          if (password !== confirm) {
            toast.error("Нууц үг таарахгүй байна");
            return;
          }
          setLoading(true);
          try {
            await api("/api/auth/reset-password", {
              method: "POST",
              body: JSON.stringify({ token, password }),
            });
            toast.success("Нууц үг шинэчлэгдлээ. Нэвтэрнэ үү.");
            router.push("/login");
          } catch (err: any) {
            toast.error(err.message || "Токен хүчингүй эсвэл хугацаа дууссан");
          } finally {
            setLoading(false);
          }
        }}
      >
        <Logo />
        <h1 className="mt-4 text-lg font-semibold">Шинэ нууц үг</h1>
        <div className="mt-4 space-y-3">
          <Field label="Шинэ нууц үг">
            <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={8} />
          </Field>
          <Field label="Нууц үг давтах">
            <Input type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} required minLength={8} />
          </Field>
        </div>
        <Button className="mt-5 w-full" disabled={loading}>
          {loading ? "Хадгалж байна..." : "Хадгалах"}
        </Button>
      </form>
    </div>
  );
}

export default function ResetPage() {
  return (
    <Suspense>
      <Inner />
    </Suspense>
  );
}
