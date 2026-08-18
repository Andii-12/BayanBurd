"use client";

import { useAuth, isStaff } from "@/lib/auth";
import { LoginForm } from "@/components/login-form";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function LoginPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading || !user) return;
    router.replace(isStaff(user.role) ? "/admin" : "/dashboard");
  }, [user, loading, router]);

  if (loading || user) {
    return <div className="p-10 text-sm text-[#6B7280]">Ачааллаж байна...</div>;
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <LoginForm mode="client" />
    </div>
  );
}
