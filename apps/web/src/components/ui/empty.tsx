import { Button } from "./button";
import Link from "next/link";

export function EmptyState({
  title,
  description,
  actionHref,
  actionLabel,
}: {
  title: string;
  description?: string;
  actionHref?: string;
  actionLabel?: string;
}) {
  return (
    <div className="card flex flex-col items-center px-6 py-14 text-center">
      <h3 className="text-base font-semibold">{title}</h3>
      {description && <p className="mt-2 max-w-md text-sm text-[#6B7280]">{description}</p>}
      {actionHref && actionLabel && (
        <Link href={actionHref} className="mt-5">
          <Button>{actionLabel}</Button>
        </Link>
      )}
    </div>
  );
}

export function ErrorState({ onRetry }: { onRetry?: () => void }) {
  return (
    <div className="card border-red-100 bg-red-50/40 px-6 py-10 text-center">
      <p className="font-medium">Мэдээлэл татах үед алдаа гарлаа.</p>
      <p className="mt-1 text-sm text-[#6B7280]">Дахин оролдоно уу.</p>
      {onRetry && (
        <Button className="mt-4" onClick={onRetry}>
          Дахин оролдох
        </Button>
      )}
    </div>
  );
}
