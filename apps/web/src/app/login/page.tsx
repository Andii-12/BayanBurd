"use client";

import { useAuth, isStaff } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/input";
import { Logo } from "@/components/logo";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <form
        className="card w-full max-w-md p-6"
        onSubmit={async (e) => {
          e.preventDefault();
          setLoading(true);
          try {
            const user = await login(email, password);
            toast.success("Амжилттай нэвтэрлээ");
            router.push(isStaff(user.role) ? "/admin" : "/dashboard");
          } catch (err: any) {
            toast.error(err.message || "Нэвтрэхэд алдаа гарлаа");
          } finally {
            setLoading(false);
          }
        }}
      >
        <Logo />
        <h1 className="mt-4 text-lg font-semibold">Нэвтрэх</h1>
        <div className="mt-4 space-y-3">
          <Field label="Имэйл">
            <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </Field>
          <Field label="Нууц үг">
            <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </Field>
        </div>
        <Button className="mt-5 w-full" disabled={loading}>
          {loading ? "..." : "Нэвтрэх"}
        </Button>
        <div className="mt-4 flex justify-between text-sm text-[#6B7280]">
          <Link href="/forgot-password">Нууц үг мартсан</Link>
          <Link href="/register">Бүртгүүлэх</Link>
        </div>
      </form>
    </div>
  );
}
