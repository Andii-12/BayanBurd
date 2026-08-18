"use client";

import { InstallationStatusBadge } from "@/components/ui/badges";
import { Button } from "@/components/ui/button";
import { Field, Input, Select, Textarea } from "@/components/ui/input";
import { api } from "@/lib/api";
import { formatDate, nameOf } from "@/lib/utils";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";

export default function AdminInstallations() {
  const qc = useQueryClient();
  const { data } = useQuery({ queryKey: ["installs"], queryFn: () => api("/api/installations") });
  const clients = useQuery({ queryKey: ["clients"], queryFn: () => api("/api/admin/clients?limit=100") });
  const engineers = useQuery({ queryKey: ["engineers"], queryFn: () => api("/api/admin/engineers") });
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    clientId: "",
    installationType: "Суурилуулалт",
    scheduledDate: "",
    scheduledTime: "10:00",
    location: "",
    engineerId: "",
    notes: "",
  });
  const create = useMutation({
    mutationFn: () => api("/api/installations", { method: "POST", body: JSON.stringify(form) }),
    onSuccess: () => {
      toast.success("Товлогдлоо");
      qc.invalidateQueries({ queryKey: ["installs"] });
      setOpen(false);
    },
  });
  const complete = useMutation({
    mutationFn: (id: string) =>
      api(`/api/installations/${id}/complete`, {
        method: "POST",
        body: JSON.stringify({ installationDate: new Date().toISOString(), location: "On site", warrantyMonths: 12, supportMonths: 12 }),
      }),
    onSuccess: () => {
      toast.success("Дууссан");
      qc.invalidateQueries({ queryKey: ["installs"] });
    },
  });
  return (
    <div>
      <div className="flex justify-between">
        <h1 className="text-xl font-semibold">Суурилуулалт</h1>
        <Button onClick={() => setOpen(true)}>Шинэ хуваарь</Button>
      </div>
      {open && (
        <form className="card mt-4 grid gap-3 p-4 sm:grid-cols-2" onSubmit={(e) => { e.preventDefault(); create.mutate(); }}>
          <Field label="Харилцагч">
            <Select value={form.clientId} onChange={(e) => setForm({ ...form, clientId: e.target.value })} required>
              <option value="">Сонгох</option>
              {(clients.data?.items || []).map((c: any) => <option key={c._id} value={c._id}>{c.companyName}</option>)}
            </Select>
          </Field>
          <Field label="Төрөл"><Input value={form.installationType} onChange={(e) => setForm({ ...form, installationType: e.target.value })} /></Field>
          <Field label="Огноо"><Input type="date" value={form.scheduledDate} onChange={(e) => setForm({ ...form, scheduledDate: e.target.value })} required /></Field>
          <Field label="Цаг"><Input value={form.scheduledTime} onChange={(e) => setForm({ ...form, scheduledTime: e.target.value })} /></Field>
          <Field label="Байршил"><Input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} required /></Field>
          <Field label="Инженер">
            <Select value={form.engineerId} onChange={(e) => setForm({ ...form, engineerId: e.target.value })}>
              <option value="">—</option>
              {(engineers.data?.items || []).map((u: any) => <option key={u._id} value={u._id}>{u.firstName} {u.lastName}</option>)}
            </Select>
          </Field>
          <div className="sm:col-span-2"><Field label="Тэмдэглэл"><Textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} /></Field></div>
          <Button>Хадгалах</Button>
        </form>
      )}
      <div className="mt-4 space-y-3">
        {(data?.items || []).map((i: any) => (
          <div key={i._id} className="card flex flex-wrap items-center justify-between gap-3 p-4 text-sm">
            <div>
              <div className="font-medium">{i.installationType} · {nameOf(i.clientId)}</div>
              <div className="text-[#6B7280]">{formatDate(i.scheduledDate)} {i.scheduledTime} · {i.location}</div>
            </div>
            <div className="flex items-center gap-2">
              <InstallationStatusBadge status={i.status} />
              {i.status !== "COMPLETED" && (
                <Button size="sm" onClick={() => complete.mutate(i._id)}>Дуусгах</Button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
