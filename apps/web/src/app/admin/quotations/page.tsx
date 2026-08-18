"use client";

import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/input";
import { api } from "@/lib/api";
import { QUOTATION_STATUS_MN, type QuotationStatus } from "@bbe/types";
import { formatDate } from "@/lib/utils";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export default function QuotationsPage() {
  const qc = useQueryClient();
  const { data } = useQuery({ queryKey: ["quotes"], queryFn: () => api("/api/quotations") });
  const patch = useMutation({
    mutationFn: ({ id, status }: any) => api(`/api/quotations/${id}`, { method: "PATCH", body: JSON.stringify({ status }) }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["quotes"] }),
  });
  const convert = useMutation({
    mutationFn: (id: string) => api(`/api/quotations/${id}/convert`, { method: "POST" }),
    onSuccess: () => { toast.success("Захиалга болголоо"); qc.invalidateQueries({ queryKey: ["quotes"] }); },
  });
  return (
    <div>
      <h1 className="text-xl font-semibold">Үнийн санал</h1>
      <div className="card mt-4 overflow-x-auto p-0">
        <table className="w-full text-sm">
          <thead className="bg-[#F7F8F6] text-left text-[12px] text-[#6B7280]">
            <tr>
              <th className="px-4 py-3">Дугаар</th>
              <th>Компани</th>
              <th>Огноо</th>
              <th>Төлөв</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {(data?.items || []).map((q: any) => (
              <tr key={q._id} className="border-t border-[#E5E7EB]">
                <td className="px-4 py-3">{q.quotationNumber}</td>
                <td>{q.companyName}</td>
                <td>{formatDate(q.createdAt)}</td>
                <td>
                  <Select className="h-8" value={q.status} onChange={(e) => patch.mutate({ id: q._id, status: e.target.value })}>
                    {Object.keys(QUOTATION_STATUS_MN).map((s) => (
                      <option key={s} value={s}>{QUOTATION_STATUS_MN[s as QuotationStatus]}</option>
                    ))}
                  </Select>
                </td>
                <td className="pr-3">
                  <Button size="sm" variant="outline" onClick={() => convert.mutate(q._id)}>Захиалга болгох</Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
