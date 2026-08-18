"use client";

import { IssuePriorityBadge, IssueStatusBadge, AssetTypeBadge } from "@/components/ui/badges";
import { Button } from "@/components/ui/button";
import { Field, Select, Textarea, Input } from "@/components/ui/input";
import { api } from "@/lib/api";
import { formatDate, nameOf } from "@/lib/utils";
import { ISSUE_STATUS_MN, ISSUE_PRIORITY_MN, type IssueStatus, type IssuePriority } from "@bbe/types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

export default function AdminIssueDetail() {
  const { id } = useParams<{ id: string }>();
  const qc = useQueryClient();
  const { data: issue } = useQuery({ queryKey: ["issue", id], queryFn: () => api(`/api/issues/${id}`) });
  const engineers = useQuery({ queryKey: ["engineers"], queryFn: () => api("/api/admin/engineers") });
  const [body, setBody] = useState("");
  const [visibility, setVisibility] = useState<"PUBLIC" | "INTERNAL">("PUBLIC");
  const [resolveOpen, setResolveOpen] = useState(false);
  const [svc, setSvc] = useState({ cause: "", actionTaken: "", partsReplaced: "", notes: "", createServiceHistory: true });

  const invalidate = () => qc.invalidateQueries({ queryKey: ["issue", id] });

  const comment = useMutation({
    mutationFn: () => api(`/api/issues/${id}/comments`, { method: "POST", body: JSON.stringify({ body, visibility }) }),
    onSuccess: () => { setBody(""); invalidate(); },
  });

  if (!issue) return null;
  const asset = issue.assetId || {};

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
      <div>
        <div className="text-sm text-[#6B7280]">#{issue.issueNumber}</div>
        <h1 className="mt-1 text-xl font-semibold">{issue.title}</h1>
        <div className="mt-2 flex gap-2">
          <IssueStatusBadge status={issue.status} />
          <IssuePriorityBadge priority={issue.priority} />
        </div>
        <div className="card mt-4 whitespace-pre-wrap p-5 text-sm">{issue.description}</div>
        <h2 className="mt-8 text-sm font-semibold">Comments</h2>
        <div className="mt-3 space-y-3">
          {(issue.comments || []).map((c: any) => (
            <div key={c._id} className={`card p-4 ${c.visibility === "INTERNAL" ? "border-amber-200 bg-amber-50/40" : ""}`}>
              <div className="flex justify-between text-[12px] text-[#6B7280]">
                <span className="font-medium text-[#171717]">
                  {nameOf(c.userId)} {c.visibility === "INTERNAL" ? "· INTERNAL" : ""}
                </span>
                <span>{formatDate(c.createdAt)}</span>
              </div>
              <p className="mt-2 whitespace-pre-wrap text-sm">{c.body}</p>
            </div>
          ))}
        </div>
        <form className="mt-4 space-y-2" onSubmit={(e) => { e.preventDefault(); comment.mutate(); }}>
          <Textarea value={body} onChange={(e) => setBody(e.target.value)} placeholder="Сэтгэгдэл / internal note" />
          <div className="flex gap-2">
            <Select value={visibility} onChange={(e) => setVisibility(e.target.value as any)}>
              <option value="PUBLIC">PUBLIC</option>
              <option value="INTERNAL">INTERNAL</option>
            </Select>
            <Button disabled={!body}>Илгээх</Button>
          </div>
        </form>
        <h2 className="mt-8 text-sm font-semibold">Activity</h2>
        <ol className="mt-3 space-y-2 border-l pl-4 text-sm">
          {(issue.activity || []).map((a: any) => (
            <li key={a._id}>{formatDate(a.createdAt)} · {a.action}</li>
          ))}
        </ol>
      </div>
      <aside className="card h-fit space-y-3 p-4 text-sm">
        <Field label="Status">
          <Select
            value={issue.status}
            onChange={async (e) => {
              await api(`/api/issues/${id}/status`, { method: "POST", body: JSON.stringify({ status: e.target.value }) });
              invalidate();
            }}
          >
            {Object.keys(ISSUE_STATUS_MN).map((s) => (
              <option key={s} value={s}>{ISSUE_STATUS_MN[s as IssueStatus]}</option>
            ))}
          </Select>
        </Field>
        <Field label="Priority">
          <Select
            value={issue.priority}
            onChange={async (e) => {
              await api(`/api/issues/${id}/priority`, { method: "POST", body: JSON.stringify({ priority: e.target.value }) });
              invalidate();
            }}
          >
            {Object.keys(ISSUE_PRIORITY_MN).map((s) => (
              <option key={s} value={s}>{ISSUE_PRIORITY_MN[s as IssuePriority]}</option>
            ))}
          </Select>
        </Field>
        <Field label="Assigned engineer">
          <Select
            value={issue.assignedAdminId?._id || issue.assignedAdminId || ""}
            onChange={async (e) => {
              await api(`/api/issues/${id}/assign`, { method: "POST", body: JSON.stringify({ assignedAdminId: e.target.value }) });
              invalidate();
            }}
          >
            <option value="">—</option>
            {(engineers.data?.items || []).map((u: any) => (
              <option key={u._id} value={u._id}>{u.firstName} {u.lastName}</option>
            ))}
          </Select>
        </Field>
        <div>Asset: {asset.name}</div>
        <div>Type: {asset.type && <AssetTypeBadge type={asset.type} />}</div>
        <div>Client: {nameOf(issue.clientId)}</div>
        <div>Location: {asset.location || "—"}</div>
        <div className="flex flex-col gap-2 pt-2">
          <Button onClick={() => setResolveOpen(true)}>Resolve</Button>
          <Button
            variant="outline"
            onClick={async () => {
              await api(`/api/issues/${id}/status`, { method: "POST", body: JSON.stringify({ status: "CLOSED" }) });
              invalidate();
            }}
          >
            Close
          </Button>
          <Button
            variant="outline"
            onClick={async () => {
              await api(`/api/issues/${id}/reopen`, { method: "POST" });
              invalidate();
            }}
          >
            Reopen
          </Button>
        </div>
      </aside>
      {resolveOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <form
            className="card w-full max-w-lg space-y-3 p-5"
            onSubmit={async (e) => {
              e.preventDefault();
              await api(`/api/issues/${id}/resolve`, { method: "POST", body: JSON.stringify(svc) });
              toast.success("Шийдвэрлэсэн");
              setResolveOpen(false);
              invalidate();
            }}
          >
            <h3 className="font-semibold">Issue шийдвэрлэх</h3>
            <Field label="Асуудлын шалтгаан"><Input value={svc.cause} onChange={(e) => setSvc({ ...svc, cause: e.target.value })} /></Field>
            <Field label="Авсан арга хэмжээ"><Textarea value={svc.actionTaken} onChange={(e) => setSvc({ ...svc, actionTaken: e.target.value })} /></Field>
            <Field label="Сольсон сэлбэг"><Input value={svc.partsReplaced} onChange={(e) => setSvc({ ...svc, partsReplaced: e.target.value })} /></Field>
            <Field label="Нэмэлт тайлбар"><Textarea value={svc.notes} onChange={(e) => setSvc({ ...svc, notes: e.target.value })} /></Field>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={svc.createServiceHistory} onChange={(e) => setSvc({ ...svc, createServiceHistory: e.target.checked })} />
              Service History үүсгэх
            </label>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setResolveOpen(false)}>Болих</Button>
              <Button>Хадгалах</Button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
