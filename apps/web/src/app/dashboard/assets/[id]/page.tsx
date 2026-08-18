"use client";

import { AssetStatusBadge, AssetTypeBadge, IssueStatusBadge, IssuePriorityBadge } from "@/components/ui/badges";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";
import { formatDate } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";

const tabs = ["Ерөнхий", "Үзүүлэлт", "Суурилуулалт", "Issues", "Үйлчилгээний түүх", "Баримт бичиг", "Activity"];

export default function AssetDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data: a } = useQuery({ queryKey: ["asset", id], queryFn: () => api(`/api/assets/${id}`) });
  const [tab, setTab] = useState("Ерөнхий");
  if (!a) return null;
  const hw = a.type === "HARDWARE";
  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold">{a.name}</h1>
          <div className="mt-1 flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-primary" />
            <AssetStatusBadge status={a.status} />
            <AssetTypeBadge type={a.type} />
            <span className="text-[12px] text-[#6B7280]">{a.assetCode}</span>
          </div>
        </div>
        <Link href={`/dashboard/issues/new?assetId=${a._id}`}>
          <Button>Issue үүсгэх</Button>
        </Link>
      </div>
      <div className="mt-6 flex flex-wrap gap-4 border-b border-[#E5E7EB] text-sm">
        {tabs.map((t) => (
          <button key={t} onClick={() => setTab(t)} className={`-mb-px border-b-2 pb-2 ${tab === t ? "border-primary text-primary" : "border-transparent text-[#6B7280]"}`}>
            {t}
          </button>
        ))}
      </div>
      <div className="card mt-4 p-5 text-sm">
        {tab === "Ерөнхий" && (
          <dl className="grid gap-2 sm:grid-cols-2">
            {hw && (
              <>
                <dt className="text-[#6B7280]">Serial</dt><dd>{a.serialNumber || "—"}</dd>
                <dt className="text-[#6B7280]">Model</dt><dd>{a.model || "—"}</dd>
                <dt className="text-[#6B7280]">Brand</dt><dd>{a.manufacturer || "—"}</dd>
                <dt className="text-[#6B7280]">Байршил</dt><dd>{a.location} {a.department}</dd>
                <dt className="text-[#6B7280]">Суурилуулсан</dt><dd>{formatDate(a.installationDate)}</dd>
                <dt className="text-[#6B7280]">Баталгаа</dt><dd>{formatDate(a.warrantyEndDate)}</dd>
              </>
            )}
            {!hw && (
              <>
                <dt className="text-[#6B7280]">Version</dt><dd>{a.version || "—"}</dd>
                <dt className="text-[#6B7280]">URL</dt><dd>{a.systemUrl || a.websiteUrl || "—"}</dd>
                <dt className="text-[#6B7280]">Environment</dt><dd>{a.environment || "—"}</dd>
                <dt className="text-[#6B7280]">Дэмжлэг дуусах</dt><dd>{formatDate(a.serviceEndDate || a.licenseEndDate)}</dd>
                <dt className="text-[#6B7280]">License</dt><dd>{a.licenseKeyMasked || "—"}</dd>
              </>
            )}
          </dl>
        )}
        {tab === "Үзүүлэлт" && <p>{a.description || "Нэмэлт үзүүлэлт байхгүй."}</p>}
        {tab === "Суурилуулалт" && <p>Суурилуулсан: {formatDate(a.installationDate)} · {a.location}</p>}
        {tab === "Issues" && (
          <div className="space-y-2">
            {(a.issues || []).map((i: any) => (
              <Link key={i._id} href={`/dashboard/issues/${i._id}`} className="flex items-center justify-between rounded-lg border border-[#E5E7EB] px-3 py-2">
                <span>#{i.issueNumber} {i.title}</span>
                <span className="flex gap-2"><IssuePriorityBadge priority={i.priority} /><IssueStatusBadge status={i.status} /></span>
              </Link>
            ))}
          </div>
        )}
        {tab === "Үйлчилгээний түүх" && (
          <ol className="space-y-3 border-l pl-4">
            {(a.history || []).map((h: any) => (
              <li key={h._id}><span className="text-[#6B7280]">{formatDate(h.performedAt)}</span> · {h.title}</li>
            ))}
          </ol>
        )}
        {tab === "Баримт бичиг" && <p>Баримт бичгийг «Баримт бичиг» цэснээс татна уу.</p>}
        {tab === "Activity" && (
          <ol className="space-y-2">
            {(a.statusHistory || []).map((s: any) => (
              <li key={s._id}>{formatDate(s.createdAt)} · {s.oldStatus || "—"} → {s.newStatus}</li>
            ))}
          </ol>
        )}
      </div>
    </div>
  );
}
