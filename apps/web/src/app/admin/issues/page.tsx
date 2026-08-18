"use client";

import { IssuePriorityBadge, IssueStatusBadge } from "@/components/ui/badges";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";
import { nameOf } from "@/lib/utils";
import {
  DndContext,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  useDroppable,
  useDraggable,
} from "@dnd-kit/core";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";

const cols = [
  { id: "OPEN", label: "OPEN" },
  { id: "ASSIGNED", label: "ASSIGNED" },
  { id: "IN_PROGRESS", label: "IN PROGRESS" },
  { id: "WAITING_CLIENT", label: "WAITING" },
  { id: "RESOLVED", label: "RESOLVED" },
];

function Inner() {
  const [view, setView] = useState<"list" | "kanban">("kanban");
  const sp = useSearchParams();
  const assetId = sp.get("assetId") || "";
  const qc = useQueryClient();
  const { data } = useQuery({
    queryKey: ["admin-issues", assetId],
    queryFn: () => api(`/api/issues?limit=100${assetId ? `&assetId=${assetId}` : ""}`),
  });
  const statusMut = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      api(`/api/issues/${id}/status`, { method: "POST", body: JSON.stringify({ status }) }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-issues"] }),
  });
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));
  const items = data?.items || [];

  function onDragEnd(e: DragEndEvent) {
    const over = e.over?.id as string | undefined;
    const id = e.active.id as string;
    if (!over || !id) return;
    const col = cols.find((c) => c.id === over);
    if (col) statusMut.mutate({ id, status: col.id });
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-xl font-semibold">Issues</h1>
        <div className="flex gap-2">
          <Button size="sm" variant={view === "list" ? "primary" : "outline"} onClick={() => setView("list")}>List</Button>
          <Button size="sm" variant={view === "kanban" ? "primary" : "outline"} onClick={() => setView("kanban")}>Kanban</Button>
        </div>
      </div>
      {view === "list" && (
        <div className="card divide-y p-0">
          {items.map((i: any) => (
            <Link key={i._id} href={`/admin/issues/${i._id}`} className="flex items-center justify-between px-4 py-3 text-sm hover:bg-[#F7F8F6]">
              <span>#{i.issueNumber} {i.title} · {nameOf(i.clientId)}</span>
              <span className="flex gap-2"><IssuePriorityBadge priority={i.priority} /><IssueStatusBadge status={i.status} /></span>
            </Link>
          ))}
        </div>
      )}
      {view === "kanban" && (
        <DndContext sensors={sensors} onDragEnd={onDragEnd}>
          <div className="grid gap-3 overflow-x-auto md:grid-cols-5">
            {cols.map((c) => (
              <KanbanCol key={c.id} id={c.id} label={c.label} items={items.filter((i: any) => (c.id === "WAITING_CLIENT" ? ["WAITING_CLIENT", "WAITING_PART"].includes(i.status) : i.status === c.id || (c.id === "OPEN" && i.status === "REOPENED")))} />
            ))}
          </div>
        </DndContext>
      )}
    </div>
  );
}

function KanbanCol({ id, label, items }: { id: string; label: string; items: any[] }) {
  const { setNodeRef } = useDroppable({ id });
  return (
    <div ref={setNodeRef} className="min-h-[420px] rounded-lg bg-[#EEF1EC] p-2">
      <div className="mb-2 px-1 text-[12px] font-semibold text-[#6B7280]">{label}</div>
      {items.map((i) => (
        <KanbanCard key={i._id} issue={i} />
      ))}
    </div>
  );
}

function KanbanCard({ issue }: { issue: any }) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({ id: issue._id });
  const style = transform ? { transform: `translate3d(${transform.x}px, ${transform.y}px, 0)` } : undefined;
  return (
    <div ref={setNodeRef} style={style} {...listeners} {...attributes} className="card mb-2 cursor-grab p-3 text-[13px]">
      <Link href={`/admin/issues/${issue._id}`} className="font-medium text-primary">#{issue.issueNumber}</Link>
      <div className="mt-1 font-medium">{issue.title}</div>
      <div className="mt-1 text-[#6B7280]">{nameOf(issue.clientId)}</div>
      <div className="text-[#6B7280]">{issue.assetId?.name}</div>
      <div className="mt-2"><IssuePriorityBadge priority={issue.priority} /></div>
      {issue.assignedAdminId && <div className="mt-1 text-[12px]">Assigned: {nameOf(issue.assignedAdminId)}</div>}
    </div>
  );
}

export default function Page() {
  return (
    <Suspense>
      <Inner />
    </Suspense>
  );
}
