"use client";

import { AssetStatusBadge, IssueStatusBadge, OrderStatusBadge } from "@/components/ui/badges";
import { api } from "@/lib/api";
import { formatDate } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";

const tabs = ["Overview", "Assets", "Orders", "Issues", "Installations", "Service History", "Documents", "Users"];

export default function ClientDetail() {
  const { id } = useParams<{ id: string }>();
  const { data } = useQuery({ queryKey: ["client", id], queryFn: () => api(`/api/admin/clients/${id}`) });
  const [tab, setTab] = useState("Overview");
  if (!data) return null;
  const c = data.client;
  return (
    <div>
      <h1 className="text-xl font-semibold">{c.companyName}</h1>
      <p className="text-sm text-[#6B7280]">{c.contactName} · {c.email} · {c.phone}</p>
      <div className="mt-4 flex flex-wrap gap-3 border-b border-[#E5E7EB] text-sm">
        {tabs.map((t) => (
          <button key={t} onClick={() => setTab(t)} className={`-mb-px border-b-2 pb-2 ${tab === t ? "border-primary text-primary" : "border-transparent text-[#6B7280]"}`}>{t}</button>
        ))}
      </div>
      <div className="card mt-4 p-5 text-sm">
        {tab === "Overview" && <p>Регистр: {c.registrationNumber}<br />Хаяг: {c.address}</p>}
        {tab === "Assets" && data.assets.map((a: any) => (
          <Link key={a._id} href={`/admin/assets/${a._id}`} className="mb-2 flex justify-between">
            <span>{a.name}</span><AssetStatusBadge status={a.status} />
          </Link>
        ))}
        {tab === "Orders" && data.orders.map((o: any) => (
          <div key={o._id} className="mb-2 flex justify-between">{o.orderNumber} <OrderStatusBadge status={o.status} /></div>
        ))}
        {tab === "Issues" && data.issues.map((i: any) => (
          <Link key={i._id} href={`/admin/issues/${i._id}`} className="mb-2 flex justify-between">
            #{i.issueNumber} {i.title} <IssueStatusBadge status={i.status} />
          </Link>
        ))}
        {tab === "Installations" && data.installations.map((i: any) => (
          <div key={i._id} className="mb-2">{formatDate(i.scheduledDate)} · {i.installationType}</div>
        ))}
        {tab === "Service History" && data.history.map((h: any) => (
          <div key={h._id} className="mb-2">{formatDate(h.performedAt)} · {h.title}</div>
        ))}
        {tab === "Documents" && <p>Баримт бичгийг asset дээр харна уу.</p>}
        {tab === "Users" && data.users.map((u: any) => (
          <div key={u._id}>{u.firstName} {u.lastName} · {u.email}</div>
        ))}
      </div>
    </div>
  );
}
