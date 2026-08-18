"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import { Search } from "lucide-react";
import { Input } from "./ui/input";
import { useAuth, isStaff } from "@/lib/auth";

export function SearchCommand() {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [data, setData] = useState<any>(null);
  const { user } = useAuth();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen(true);
      }
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    if (!open || q.length < 2) return;
    const t = setTimeout(() => {
      api(`/api/search?q=${encodeURIComponent(q)}`).then(setData).catch(() => setData(null));
    }, 250);
    return () => clearTimeout(t);
  }, [q, open]);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex h-9 items-center gap-2 rounded-[10px] border border-[#E5E7EB] bg-white px-3 text-[13px] text-[#6B7280] hover:border-primary/40"
      >
        <Search className="h-4 w-4" />
        <span className="hidden sm:inline">Хайх...</span>
        <kbd className="ml-2 hidden rounded border px-1 text-[10px] lg:inline">Ctrl K</kbd>
      </button>
      {open && (
        <div className="fixed inset-0 z-50 bg-black/40 p-4" onClick={() => setOpen(false)}>
          <div className="card mx-auto mt-20 max-w-xl overflow-hidden p-0" onClick={(e) => e.stopPropagation()}>
            <div className="p-3">
              <Input autoFocus placeholder="DL380, Issue, захиалга..." value={q} onChange={(e) => setQ(e.target.value)} />
            </div>
            <div className="max-h-[420px] overflow-y-auto border-t border-[#E5E7EB] p-3 text-sm">
              {!data && <p className="px-2 py-6 text-center text-[#6B7280]">Хайх үгээ оруулна уу</p>}
              {data && (
                <div className="space-y-4">
                  <Group title="PRODUCTS" items={data.products} href={(i: any) => `/products/${i.slug}`} label={(i: any) => i.name} />
                  {user && (
                    <Group
                      title="ASSETS"
                      items={data.assets}
                      href={(i: any) => (isStaff(user.role) ? `/admin/assets/${i._id}` : `/dashboard/assets/${i._id}`)}
                      label={(i: any) => `${i.name}${i.clientId?.companyName ? " / " + i.clientId.companyName : ""}`}
                    />
                  )}
                  {user && (
                    <Group
                      title="ISSUES"
                      items={data.issues}
                      href={(i: any) =>
                        isStaff(user.role) ? `/admin/issues/${i._id}` : `/dashboard/issues/${i._id}`
                      }
                      label={(i: any) => `#${i.issueNumber} ${i.title}`}
                    />
                  )}
                  {user && (
                    <Group
                      title="ORDERS"
                      items={data.orders}
                      href={(i: any) => (isStaff(user.role) ? `/admin/orders/${i._id}` : `/dashboard/orders/${i._id}`)}
                      label={(i: any) => i.orderNumber}
                    />
                  )}
                  {isStaff(user?.role) && (
                    <Group
                      title="CLIENTS"
                      items={data.clients}
                      href={(i: any) => `/admin/clients/${i._id}`}
                      label={(i: any) => i.companyName}
                    />
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function Group({ title, items, href, label }: any) {
  if (!items?.length) return null;
  return (
    <div>
      <div className="mb-1 px-2 text-[11px] font-semibold tracking-wide text-[#9CA3AF]">{title}</div>
      {items.map((i: any) => (
        <Link key={i._id} href={href(i)} className="block rounded-md px-2 py-1.5 hover:bg-primary-light">
          {label(i)}
        </Link>
      ))}
    </div>
  );
}
