"use client";

import { MetricCard } from "@/components/ui/card";
import { DashboardSkeleton } from "@/components/ui/skeleton";
import { IssuePriorityBadge, IssueStatusBadge, OrderStatusBadge, InstallationStatusBadge } from "@/components/ui/badges";
import { api } from "@/lib/api";
import { formatDate, nameOf } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";

export default function AdminHome() {
  const { data, isLoading } = useQuery({ queryKey: ["admin-dash"], queryFn: () => api("/api/admin/dashboard") });
  if (isLoading) return <DashboardSkeleton />;
  const k = data?.kpis || {};
  const groups = data?.issueGroups || [];
  const count = (s: string) => groups.filter((g: any) => g._id === s).reduce((a: number, g: any) => a + g.count, 0);
  const waiting = count("WAITING_CLIENT") + count("WAITING_PART");
  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold">Dashboard</h1>
      <div className="grid grid-cols-2 gap-4 xl:grid-cols-6">
        <MetricCard label="Нийт харилцагч" value={k.clients || 0} />
        <MetricCard label="Нийт Asset" value={k.assets || 0} />
        <MetricCard label="Open Issues" value={k.openIssues || 0} />
        <MetricCard label="Critical Issues" value={k.criticalIssues || 0} />
        <MetricCard label="Pending Orders" value={k.pendingOrders || 0} />
        <MetricCard label="Upcoming Installations" value={k.upcomingInstallations || 0} />
      </div>
      <div className="card p-5">
        <h2 className="text-sm font-semibold">Issue Overview</h2>
        <div className="mt-4 grid grid-cols-4 gap-3 text-center text-sm">
          {[
            ["Open", count("OPEN") + count("REOPENED")],
            ["In Progress", count("IN_PROGRESS") + count("ASSIGNED")],
            ["Waiting", waiting],
            ["Resolved", count("RESOLVED")],
          ].map(([l, v]) => (
            <div key={String(l)} className="rounded-lg bg-[#F7F8F6] py-4">
              <div className="text-2xl font-semibold">{v as number}</div>
              <div className="text-[12px] text-[#6B7280]">{l as string}</div>
            </div>
          ))}
        </div>
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <List title="Recent Issues" href="/admin/issues">
          {(data?.recentIssues || []).map((i: any) => (
            <Link key={i._id} href={`/admin/issues/${i._id}`} className="flex items-center justify-between py-2 text-sm">
              <span>#{i.issueNumber} {i.title}</span>
              <span className="flex gap-1"><IssuePriorityBadge priority={i.priority} /><IssueStatusBadge status={i.status} /></span>
            </Link>
          ))}
        </List>
        <List title="Recent Orders" href="/admin/orders">
          {(data?.recentOrders || []).map((o: any) => (
            <Link key={o._id} href={`/admin/orders/${o._id}`} className="flex items-center justify-between py-2 text-sm">
              <span>{o.orderNumber} · {nameOf(o.clientId)}</span>
              <OrderStatusBadge status={o.status} />
            </Link>
          ))}
        </List>
        <List title="Upcoming Installations" href="/admin/installations">
          {(data?.upcoming || []).map((i: any) => (
            <div key={i._id} className="flex items-center justify-between py-2 text-sm">
              <span>{formatDate(i.scheduledDate)} · {nameOf(i.clientId)}</span>
              <InstallationStatusBadge status={i.status} />
            </div>
          ))}
        </List>
        <List title="Expiring Warranty / Licenses" href="/admin/warranty">
          {[...(data?.expiringWarranty || []), ...(data?.expiringLicenses || [])].map((a: any) => (
            <Link key={a._id} href={`/admin/assets/${a._id}`} className="block py-2 text-sm">
              {a.name} · {nameOf(a.clientId)}
            </Link>
          ))}
        </List>
      </div>
    </div>
  );
}

function List({ title, href, children }: { title: string; href: string; children: React.ReactNode }) {
  return (
    <div className="card p-5">
      <div className="mb-2 flex justify-between">
        <h2 className="text-sm font-semibold">{title}</h2>
        <Link href={href} className="text-[12px] text-primary">Бүгд</Link>
      </div>
      {children}
    </div>
  );
}
