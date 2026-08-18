"use client";

import { Button } from "@/components/ui/button";
import { Field, Input, Select } from "@/components/ui/input";
import { api } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

export default function NewAsset() {
  const router = useRouter();
  const clients = useQuery({ queryKey: ["clients"], queryFn: () => api("/api/admin/clients?limit=100") });
  const [form, setForm] = useState({ clientId: "", name: "", type: "HARDWARE", serialNumber: "", version: "", location: "" });
  return (
    <form
      className="card max-w-lg space-y-3 p-5"
      onSubmit={async (e) => {
        e.preventDefault();
        const a = await api("/api/assets", { method: "POST", body: JSON.stringify(form) });
        toast.success("Asset үүслээ");
        router.push(`/admin/assets/${a._id}`);
      }}
    >
      <h1 className="text-lg font-semibold">Шинэ Asset</h1>
      <Field label="Харилцагч">
        <Select value={form.clientId} onChange={(e) => setForm({ ...form, clientId: e.target.value })} required>
          <option value="">Сонгох</option>
          {(clients.data?.items || []).map((c: any) => <option key={c._id} value={c._id}>{c.companyName}</option>)}
        </Select>
      </Field>
      <Field label="Нэр"><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required /></Field>
      <Field label="Төрөл">
        <Select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
          <option>HARDWARE</option><option>SOFTWARE</option><option>WEBSITE</option><option>SYSTEM</option><option>LICENSE</option><option>SERVICE</option>
        </Select>
      </Field>
      <Field label="Serial"><Input value={form.serialNumber} onChange={(e) => setForm({ ...form, serialNumber: e.target.value })} /></Field>
      <Field label="Version"><Input value={form.version} onChange={(e) => setForm({ ...form, version: e.target.value })} /></Field>
      <Field label="Байршил"><Input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} /></Field>
      <Button>Үүсгэх</Button>
    </form>
  );
}
