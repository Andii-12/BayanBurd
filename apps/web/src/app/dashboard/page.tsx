"use client";

import { MetricCard } from "@/components/ui/card";
import { DashboardSkeleton } from "@/components/ui/skeleton";
import { ErrorState } from "@/components/ui/empty";
import { AssetStatusBadge, IssueStatusBadge, OrderStatusBadge } from "@/components/ui/badges";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { formatDate } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";

export default function ClientDashboard() {
  const { client } = useAuth();
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["client-dash"],
    queryFn: () => api("/api/dashboard"),
  });
  if (isLoading) return <DashboardSkeleton />;
  if (isError) return <ErrorState onRetry={() => refetch()} />;
  const k = data.kpis || {};
  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold">Сайн байна уу, {client?.companyName}</h1>
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <MetricCard label="Нийт бүтээгдэхүүн" value={k.total || 0} />
        <MetricCard label="Идэвхтэй" value={k.active || 0} />
        <MetricCard label="Суурилуулалт" value={k.installPending || 0} />
        <MetricCard label="Issue" value={k.openIssues || 0} />
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="card p-5">
          <h2 className="text-sm font-semibold">Миний бүтээгдэхүүн</h2>
          <div className="mt-3 space-y-2">
            {(data.recentAssets || []).map((a: any) => (
              <Link key={a._id} href={`/dashboard/assets/${a._id}`} className="flex items-center justify-between rounded-lg px-2 py-2 hover:bg-[#F7F8F6]">
                <div>
                  <div className="text-sm font-medium">{a.name}</div>
                  <div className="text-[12px] text-[#6B7280]">{a.assetCode}</div>
                </div>
                <AssetStatusBadge status={a.status} />
              </Link>
            ))}
          </div>
        </div>
        <div className="card p-5">
          <h2 className="text-sm font-semibold">Сүүлийн үйл ажиллагаа</h2>
          <ol className="mt-3 space-y-3 border-l border-[#E5E7EB] pl-4">
            {(data.recentIssues || []).map((i: any) => (
              <li key={i._id} className="text-sm">
                <Link href={`/dashboard/issues/${i._id}`} className="hover:text-primary">
                  Issue #{i.issueNumber} шинэчлэгдсэн
                </Link>
                <div className="text-[12px] text-[#6B7280]">{i.title}</div>
              </li>
            ))}
            {(data.recentOrders || []).map((o: any) => (
              <li key={o._id} className="text-sm">
                Order #{o.orderNumber} — <OrderStatusBadge status={o.status} />
              </li>
            ))}
            {(data.history || []).map((h: any) => (
              <li key={h._id} className="text-sm">
                {formatDate(h.performedAt)} · {h.title}
              </li>
            ))}
          </ol>
        </div>
      </div>
    </div>
  );
}
