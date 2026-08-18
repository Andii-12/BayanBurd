"use client";

import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm";
import { Field, Input, Select } from "@/components/ui/input";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export default function UsersPage() {
  const { user: me } = useAuth();
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
  const remove = useMutation({
    mutationFn: (id: string) => api(`/api/admin/users/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      toast.success("Хэрэглэгч устгалаа");
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
              <th className="pr-4 text-right">Үйлдэл</th>
            </tr>
          </thead>
          <tbody>
            {(data?.items || []).map((u: any) => {
              const isMe = me?.id === u._id;
              return (
                <tr key={u._id} className="border-t border-[#E5E7EB]">
                  <td className="px-4 py-3">{u.firstName} {u.lastName}</td>
                  <td>{u.email}</td>
                  <td>{u.role}</td>
                  <td className="pr-4 text-right">
                    {isMe ? (
                      <span className="text-[12px] text-[#9CA3AF]">Та</span>
                    ) : (
                      <ConfirmDialog
                        title="Хэрэглэгч устгах уу?"
                        description={`${u.firstName} ${u.lastName} (${u.email}) бүртгэлийг устгана.`}
                        confirmLabel="Устгах"
                        onConfirm={() => remove.mutateAsync(u._id)}
                        trigger={
                          <Button type="button" variant="danger" size="sm" disabled={remove.isPending}>
                            <Trash2 className="h-3.5 w-3.5" />
                            Устгах
                          </Button>
                        }
                      />
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
