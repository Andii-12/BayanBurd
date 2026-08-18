"use client";

import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/input";
import { Logo } from "@/components/logo";
import { useSearchParams, useRouter } from "next/navigation";
import { Suspense, useState } from "react";
import { toast } from "sonner";

function Inner() {
  const sp = useSearchParams();
  const router = useRouter();
  const [password, setPassword] = useState("");
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <form
        className="card w-full max-w-md p-6"
        onSubmit={async (e) => {
          e.preventDefault();
          await api("/api/auth/reset-password", {
            method: "POST",
            body: JSON.stringify({ token: sp.get("token"), password }),
          });
          toast.success("Нууц үг шинэчлэгдлээ");
          router.push("/login");
        }}
      >
        <Logo />
        <h1 className="mt-4 text-lg font-semibold">Шинэ нууц үг</h1>
        <div className="mt-4">
          <Field label="Нууц үг"><Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required /></Field>
        </div>
        <Button className="mt-5 w-full">Хадгалах</Button>
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
