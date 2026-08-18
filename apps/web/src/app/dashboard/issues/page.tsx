"use client";

import { EmptyState } from "@/components/ui/empty";
import { IssuePriorityBadge, IssueStatusBadge } from "@/components/ui/badges";
import { Button } from "@/components/ui/button";
import { Input, Select } from "@/components/ui/input";
import { api } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";

const statusFilters = [
  { v: "", l: "Бүх Issues" },
  { v: "openish", l: "Нээлттэй" },
  { v: "IN_PROGRESS", l: "In Progress" },
  { v: "waiting", l: "Хүлээгдэж байгаа" },
  { v: "RESOLVED", l: "Шийдвэрлэсэн" },
  { v: "CLOSED", l: "Хаагдсан" },
];

function Inner() {
  const sp = useSearchParams();
  const [status, setStatus] = useState(sp.get("status") || "");
  const [search, setSearch] = useState("");
  const [priority, setPriority] = useState("");
  const assetId = sp.get("assetId") || "";
  const { data } = useQuery({
    queryKey: ["issues", status, search, priority, assetId],
    queryFn: () => {
      const q = new URLSearchParams();
      if (status) q.set("status", status);
      if (search) q.set("search", search);
      if (priority) q.set("priority", priority);
      if (assetId) q.set("assetId", assetId);
      q.set("limit", "50");
      return api(`/api/issues?${q}`);
    },
  });
  return (
    <div className="grid gap-4 lg:grid-cols-[220px_1fr]">
      <aside className="card h-fit p-3 text-sm">
        {statusFilters.map((f) => (
          <button
            key={f.v}
            onClick={() => setStatus(f.v)}
            className={`mb-1 block w-full rounded-lg px-3 py-2 text-left ${status === f.v ? "bg-primary-light text-primary" : "hover:bg-[#F7F8F6]"}`}
          >
            {f.l}
          </button>
        ))}
      </aside>
      <div>
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <h1 className="text-xl font-semibold">Issues</h1>
          <Link href="/dashboard/issues/new"><Button>Шинэ Issue</Button></Link>
        </div>
        <div className="mb-3 flex gap-2">
          <Input placeholder="Issue хайх..." value={search} onChange={(e) => setSearch(e.target.value)} />
          <Select value={priority} onChange={(e) => setPriority(e.target.value)}>
            <option value="">Priority</option>
            <option value="LOW">Бага</option>
            <option value="MEDIUM">Дунд</option>
            <option value="HIGH">Өндөр</option>
            <option value="CRITICAL">Ноцтой</option>
          </Select>
        </div>
        {data?.items?.length === 0 && (
          <EmptyState
            title="Одоогоор Issue байхгүй байна."
            description="Танд асуудал гарвал өөрийн бүтээгдэхүүн дээрээс Issue үүсгэх боломжтой."
            actionHref="/dashboard/assets"
            actionLabel="Миний бүтээгдэхүүн"
          />
        )}
        <div className="card divide-y divide-[#E5E7EB] p-0">
          {(data?.items || []).map((i: any) => (
            <Link key={i._id} href={`/dashboard/issues/${i._id}`} className="flex items-center justify-between px-4 py-3 hover:bg-[#F7F8F6]">
              <div>
                <div className="text-sm font-medium">#{i.issueNumber} {i.title}</div>
                <div className="text-[12px] text-[#6B7280]">{i.assetId?.name}</div>
              </div>
              <div className="flex gap-2">
                <IssuePriorityBadge priority={i.priority} />
                <IssueStatusBadge status={i.status} />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function IssuesPage() {
  return (
    <Suspense>
      <Inner />
    </Suspense>
  );
}
