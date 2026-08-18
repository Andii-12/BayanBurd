import { cn } from "@/lib/utils";

export function Card({ className, children }: { className?: string; children: React.ReactNode }) {
  return <div className={cn("card p-5", className)}>{children}</div>;
}

export function MetricCard({
  label,
  value,
  hint,
}: {
  label: string;
  value: number | string;
  hint?: string;
}) {
  return (
    <Card>
      <div className="text-[13px] text-[#6B7280]">{label}</div>
      <div className="mt-1 text-[28px] font-semibold tracking-tight text-[#171717]">{value}</div>
      {hint && <div className="mt-1 text-[12px] text-[#9CA3AF]">{hint}</div>}
    </Card>
  );
}
