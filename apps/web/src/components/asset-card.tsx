"use client";

import Link from "next/link";
import { AssetStatusBadge, AssetTypeBadge } from "./ui/badges";
import { Button } from "./ui/button";
import { formatDate } from "@/lib/utils";

export function AssetCard({
  asset,
  href,
  issueHref,
}: {
  asset: any;
  href: string;
  issueHref?: string;
}) {
  return (
    <div className="card p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold">{asset.name}</h3>
          <div className="mt-1 text-[12px] text-[#6B7280]">{asset.assetCode}</div>
        </div>
        <AssetStatusBadge status={asset.status} />
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        <AssetTypeBadge type={asset.type} />
        {typeof asset.openIssueCount === "number" && (
          <Link
            href={issueHref || `/dashboard/issues?assetId=${asset._id}`}
            className="text-[12px] text-danger hover:underline"
          >
            Open Issues: {asset.openIssueCount}
          </Link>
        )}
      </div>
      <dl className="mt-3 grid grid-cols-2 gap-2 text-[12px] text-[#6B7280]">
        {asset.serialNumber && (
          <>
            <dt>Serial</dt>
            <dd className="text-[#171717]">{asset.serialNumber}</dd>
          </>
        )}
        {asset.version && (
          <>
            <dt>Version</dt>
            <dd className="text-[#171717]">{asset.version}</dd>
          </>
        )}
        {asset.installationDate && (
          <>
            <dt>Суулгасан</dt>
            <dd className="text-[#171717]">{formatDate(asset.installationDate)}</dd>
          </>
        )}
        {(asset.warrantyEndDate || asset.serviceEndDate) && (
          <>
            <dt>Баталгаа / дэмжлэг</dt>
            <dd className="text-[#171717]">{formatDate(asset.warrantyEndDate || asset.serviceEndDate)} хүртэл</dd>
          </>
        )}
        {asset.location && (
          <>
            <dt>Байршил</dt>
            <dd className="text-[#171717]">{asset.location}{asset.department ? ` / ${asset.department}` : ""}</dd>
          </>
        )}
        {(asset.systemUrl || asset.websiteUrl) && (
          <>
            <dt>URL</dt>
            <dd className="truncate text-[#171717]">{asset.systemUrl || asset.websiteUrl}</dd>
          </>
        )}
      </dl>
      <div className="mt-4 flex gap-2">
        <Link href={href}>
          <Button size="sm" variant="outline">
            Дэлгэрэнгүй
          </Button>
        </Link>
        <Link href={`/dashboard/issues/new?assetId=${asset._id}`}>
          <Button size="sm">Issue үүсгэх</Button>
        </Link>
      </div>
    </div>
  );
}
