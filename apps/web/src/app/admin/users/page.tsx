"use client";

import { Button } from "@/components/ui/button";
import { Field, Input, Select } from "@/components/ui/input";
import { api } from "@/lib/api";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";

export default function UsersPage() {
  const qc = useQueryClient();
  const { data } = useQuery({ queryKey: ["users"], queryFn: () => api("/api/admin/users") });
  const [form, setForm] = useState({ firstName: "", lastName: "", email: "", phone: "", password: "", role: "ADMIN" });
  const create = useMutation({
    mutationFn: () => api("/api/admin/users", { method: "POST", body: JSON.stringify(form) }),
    onSuccess: () => {
      toast.success("Хэрэглэгч үүслээ");
      qc.invalidateQueries({ queryKey: ["users"] });
    },
    onError: (e: any) => toast.error(e.message),
  });
  return (
    <div>
      <h1 className="text-xl font-semibold">Users</h1>
      <form className="card mt-4 grid gap-3 p-4 sm:grid-cols-3" onSubmit={(e) => { e.preventDefault(); create.mutate(); }}>
        <Field label="Нэр"><Input value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} /></Field>
        <Field label="Овог"><Input value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} /></Field>
        <Field label="Имэйл"><Input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></Field>
        <Field label="Утас"><Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></Field>
        <Field label="Нууц үг"><Input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} /></Field>
        <Field label="Role">
          <Select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
            <option>ADMIN</option><option>ENGINEER</option><option>SUPPORT</option><option>SALES</option><option>SUPER_ADMIN</option>
          </Select>
        </Field>
        <Button>Нэмэх</Button>
      </form>
      <div className="card mt-4 overflow-x-auto p-0">
        <table className="w-full text-sm">
          <thead className="bg-[#F7F8F6] text-left text-[12px] text-[#6B7280]">
            <tr>
              <th className="px-4 py-3">Нэр</th>
              <th>Имэйл</th>
              <th>Role</th>
            </tr>
          </thead>
          <tbody>
            {(data?.items || []).map((u: any) => (
              <tr key={u._id} className="border-t border-[#E5E7EB]">
                <td className="px-4 py-3">{u.firstName} {u.lastName}</td>
                <td>{u.email}</td>
                <td>{u.role}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
