"use client";

import { useAuth, isStaff } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/input";
import { Logo } from "@/components/logo";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

export function LoginForm({ mode }: { mode: "client" | "admin" }) {
  const { login, logout } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const isAdmin = mode === "admin";

  return (
    <form
      className="card w-full max-w-md p-6"
      onSubmit={async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
          const user = await login(email, password);
          const staff = isStaff(user.role);
          if (isAdmin && !staff) {
            await logout();
            toast.error("Энэ хэсэг зөвхөн админ / ажилтанд зориулагдсан.");
            return;
          }
          if (!isAdmin && staff) {
            await logout();
            toast.error("Харилцагчийн нэвтрэлт. Админ бол /admin хуудсаар нэвтэрнэ үү.");
            return;
          }
          toast.success("Амжилттай нэвтэрлээ");
          if (!isAdmin) router.push("/dashboard");
        } catch (err: any) {
          toast.error(err.message || "Нэвтрэхэд алдаа гарлаа");
        } finally {
          setLoading(false);
        }
      }}
    >
      <Logo />
      <h1 className="mt-4 text-lg font-semibold">{isAdmin ? "Админ нэвтрэх" : "Нэвтрэх"}</h1>
      <p className="mt-1 text-sm text-[#6B7280]">{isAdmin ? "Ажилтны портал" : "Харилцагчийн портал"}</p>
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
      {isAdmin ? (
        <p className="mt-4 text-center text-sm text-[#6B7280]">
          Харилцагч уу?{" "}
          <Link href="/login" className="text-primary">
            Энд нэвтэрнэ үү
          </Link>
        </p>
      ) : (
        <div className="mt-4 flex justify-between text-sm text-[#6B7280]">
          <Link href="/forgot-password">Нууц үг мартсан</Link>
          <Link href="/register">Бүртгүүлэх</Link>
        </div>
      )}
    </form>
  );
}
