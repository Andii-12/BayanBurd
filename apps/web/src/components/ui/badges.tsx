import { cn } from "@/lib/utils";
import {
  ASSET_STATUS_MN,
  ASSET_TYPE_MN,
  ISSUE_PRIORITY_MN,
  ISSUE_STATUS_MN,
  ORDER_STATUS_MN,
  INSTALLATION_STATUS_MN,
  type AssetStatus,
  type AssetType,
  type IssuePriority,
  type IssueStatus,
  type OrderStatus,
  type InstallationStatus,
} from "@bbe/types";

export function Badge({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span className={cn("inline-flex items-center rounded-md px-2 py-0.5 text-[12px] font-medium", className)}>
      {children}
    </span>
  );
}

const assetStatusClass: Record<string, string> = {
  ORDERED: "bg-gray-100 text-gray-700",
  PREPARING: "bg-blue-50 text-blue-700",
  DELIVERY_PENDING: "bg-blue-50 text-blue-700",
  INSTALLATION_PENDING: "bg-orange-50 text-orange-dark",
  INSTALLATION_SCHEDULED: "bg-orange-50 text-orange-dark",
  INSTALLING: "bg-orange-50 text-orange-dark",
  INSTALLED: "bg-primary-light text-primary",
  ACTIVE: "bg-primary-light text-primary",
  MAINTENANCE: "bg-amber-50 text-amber-700",
  HAS_ISSUE: "bg-red-50 text-danger",
  SUSPENDED: "bg-gray-100 text-gray-600",
  EXPIRED: "bg-red-50 text-danger",
  RETIRED: "bg-gray-100 text-gray-500",
};

export function AssetStatusBadge({ status }: { status: AssetStatus | string }) {
  return <Badge className={assetStatusClass[status] || "bg-gray-100"}>{ASSET_STATUS_MN[status as AssetStatus] || status}</Badge>;
}

export function AssetTypeBadge({ type }: { type: AssetType | string }) {
  return <Badge className="bg-primary-light text-primary">{ASSET_TYPE_MN[type as AssetType] || type}</Badge>;
}

const issueStatusClass: Record<string, string> = {
  OPEN: "bg-green-50 text-green-700",
  ASSIGNED: "bg-blue-50 text-blue-700",
  IN_PROGRESS: "bg-indigo-50 text-indigo-700",
  WAITING_CLIENT: "bg-amber-50 text-amber-700",
  WAITING_PART: "bg-amber-50 text-amber-700",
  RESOLVED: "bg-primary-light text-primary",
  CLOSED: "bg-gray-100 text-gray-600",
  REOPENED: "bg-orange-50 text-orange-dark",
};

export function IssueStatusBadge({ status }: { status: IssueStatus | string }) {
  return <Badge className={issueStatusClass[status] || "bg-gray-100"}>{ISSUE_STATUS_MN[status as IssueStatus] || status}</Badge>;
}

const prioClass: Record<string, string> = {
  LOW: "bg-gray-100 text-gray-600",
  MEDIUM: "bg-blue-50 text-info",
  HIGH: "bg-orange-50 text-orange-dark",
  CRITICAL: "bg-red-50 text-danger",
};

export function IssuePriorityBadge({ priority }: { priority: IssuePriority | string }) {
  return <Badge className={prioClass[priority] || "bg-gray-100"}>{ISSUE_PRIORITY_MN[priority as IssuePriority] || priority}</Badge>;
}

export function OrderStatusBadge({ status }: { status: OrderStatus | string }) {
  return <Badge className="bg-primary-light text-primary">{ORDER_STATUS_MN[status as OrderStatus] || status}</Badge>;
}

export function InstallationStatusBadge({ status }: { status: InstallationStatus | string }) {
  return (
    <Badge className="bg-orange-50 text-orange-dark">
      {INSTALLATION_STATUS_MN[status as InstallationStatus] || status}
    </Badge>
  );
}
