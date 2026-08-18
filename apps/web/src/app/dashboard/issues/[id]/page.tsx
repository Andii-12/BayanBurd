"use client";

import { IssuePriorityBadge, IssueStatusBadge, AssetTypeBadge } from "@/components/ui/badges";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/input";
import { ImageGallery, ImagePicker, isImageUrl } from "@/components/image-picker";
import { api, toFormData } from "@/lib/api";
import { formatDate, nameOf } from "@/lib/utils";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

export default function IssueDetailPage() {
  const { id } = useParams<{ id: string }>();
  const qc = useQueryClient();
  const { data: issue } = useQuery({ queryKey: ["issue", id], queryFn: () => api(`/api/issues/${id}`) });
  const [body, setBody] = useState("");
  const [commentImages, setCommentImages] = useState<File[]>([]);
  const comment = useMutation({
    mutationFn: () =>
      api(`/api/issues/${id}/comments`, {
        method: "POST",
        body: toFormData({ body, visibility: "PUBLIC" }, commentImages),
      }),
    onSuccess: () => {
      setBody("");
      setCommentImages([]);
      qc.invalidateQueries({ queryKey: ["issue", id] });
    },
    onError: (e: any) => toast.error(e.message),
  });
  if (!issue) return null;
  const asset = issue.assetId || {};
  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_280px]">
      <div>
        <div className="text-sm text-[#6B7280]">#{issue.issueNumber}</div>
        <h1 className="mt-1 text-xl font-semibold">{issue.title}</h1>
        <div className="mt-2"><IssueStatusBadge status={issue.status} /></div>
        <div className="card mt-4 whitespace-pre-wrap p-5 text-sm leading-relaxed">{issue.description}</div>
        {issue.attachments?.length > 0 && (
          <div className="mt-3">
            <ImageGallery urls={issue.attachments.filter(isImageUrl).map((a: any) => a.url)} />
            <div className="mt-2 text-sm">
              {issue.attachments.filter((a: any) => !isImageUrl(a)).map((a: any) => (
                <a key={a.url} href={a.url} className="mr-3 text-primary underline">{a.name}</a>
              ))}
            </div>
          </div>
        )}
        <h2 className="mt-8 text-sm font-semibold">Comments</h2>
        <div className="mt-3 space-y-3">
          {(issue.comments || []).map((c: any) => (
            <div key={c._id} className="card p-4">
              <div className="flex justify-between text-[12px] text-[#6B7280]">
                <span className="font-medium text-[#171717]">{nameOf(c.userId)}</span>
                <span>{formatDate(c.createdAt)}</span>
              </div>
              <p className="mt-2 whitespace-pre-wrap text-sm">{c.body}</p>
              {c.attachments?.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-2">
                  {c.attachments.map((a: any) =>
                    isImageUrl(a) ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <a key={a.url} href={a.url} target="_blank" rel="noreferrer">
                        <img src={a.url} alt={a.name} className="h-20 w-20 rounded-md object-cover" />
                      </a>
                    ) : (
                      <a key={a.url} href={a.url} className="text-sm text-primary underline">{a.name}</a>
                    )
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
        <form
          className="mt-4"
          onSubmit={(e) => {
            e.preventDefault();
            comment.mutate();
          }}
        >
          <Textarea value={body} onChange={(e) => setBody(e.target.value)} placeholder="Сэтгэгдэл бичих..." />
          <div className="mt-2">
            <ImagePicker files={commentImages} onChange={setCommentImages} max={4} label="Зураг хавсаргах" />
          </div>
          <Button className="mt-2" disabled={!body || comment.isPending}>Илгээх</Button>
        </form>
        <h2 className="mt-8 text-sm font-semibold">Activity</h2>
        <ol className="mt-3 space-y-2 border-l border-[#E5E7EB] pl-4 text-sm">
          {(issue.activity || []).map((a: any) => (
            <li key={a._id}>
              <span className="text-[#6B7280]">{formatDate(a.createdAt)}</span> · {a.action}
            </li>
          ))}
        </ol>
      </div>
      <aside className="card h-fit space-y-3 p-4 text-sm">
        <Row k="Status" v={<IssueStatusBadge status={issue.status} />} />
        <Row k="Priority" v={<IssuePriorityBadge priority={issue.priority} />} />
        <Row k="Asset" v={asset.name} />
        <Row k="Type" v={asset.type ? <AssetTypeBadge type={asset.type} /> : "—"} />
        <Row k="Assigned" v={issue.assignedAdminId ? nameOf(issue.assignedAdminId) : "—"} />
        <Row k="Created" v={formatDate(issue.createdAt)} />
        <Row k="Updated" v={formatDate(issue.updatedAt)} />
        <Row k="Client" v={nameOf(issue.clientId)} />
        <Row k="Location" v={asset.location || "—"} />
      </aside>
    </div>
  );
}

function Row({ k, v }: { k: string; v: React.ReactNode }) {
  return (
    <div>
      <div className="text-[12px] text-[#6B7280]">{k}</div>
      <div className="mt-0.5">{v}</div>
    </div>
  );
}
