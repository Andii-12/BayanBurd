"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Logo } from "./logo";
import { useAuth, isStaff } from "@/lib/auth";
import { SearchCommand } from "./search-command";
import { NotificationDropdown } from "./notification-dropdown";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Package,
  Monitor,
  AppWindow,
  ShoppingBag,
  Wrench,
  Shield,
  CircleDot,
  History,
  FileText,
  Bell,
  User,
  Menu,
  LogOut,
} from "lucide-react";

const items = [
  { href: "/dashboard", label: "Хураангуй", icon: LayoutDashboard },
  { href: "/dashboard/assets", label: "Миний бүтээгдэхүүн", icon: Package },
  { href: "/dashboard/devices", label: "Төхөөрөмж", icon: Monitor },
  { href: "/dashboard/systems", label: "Программ / Систем", icon: AppWindow },
  { href: "/dashboard/orders", label: "Захиалгууд", icon: ShoppingBag },
  { href: "/dashboard/installations", label: "Суурилуулалт", icon: Wrench },
  { href: "/dashboard/warranty", label: "Баталгаат хугацаа", icon: Shield },
  { href: "/dashboard/issues", label: "Issues", icon: CircleDot },
  { href: "/dashboard/service-history", label: "Үйлчилгээний түүх", icon: History },
  { href: "/dashboard/documents", label: "Баримт бичиг", icon: FileText },
  { href: "/dashboard/notifications", label: "Мэдэгдэл", icon: Bell },
  { href: "/dashboard/profile", label: "Профайл", icon: User },
];

export function ClientShell({ children }: { children: React.ReactNode }) {
  const { user, client, loading, logout } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (loading) return;
    if (!user) router.replace("/login");
    else if (isStaff(user.role)) router.replace("/admin");
  }, [user, loading, router]);

  if (loading || !user) return <div className="p-10 text-sm text-[#6B7280]">Ачааллаж байна...</div>;

  const side = (
    <aside className="flex h-full w-[250px] flex-col bg-primary-dark text-white">
      <div className="border-b border-white/10 px-4 py-4">
        <Link href="/">
          <Logo light />
        </Link>
      </div>
      <nav className="flex-1 space-y-0.5 overflow-y-auto p-3 text-[13px]">
        {items.map((it) => {
          const active = pathname === it.href;
          const Icon = it.icon;
          return (
            <Link
              key={it.href}
              href={it.href}
              onClick={() => setOpen(false)}
              className={cn(
                "flex items-center gap-2.5 rounded-lg px-3 py-2 text-white/80 hover:bg-white/10",
                active && "bg-white/15 font-medium text-white"
              )}
            >
              <Icon className="h-4 w-4" />
              {it.label}
            </Link>
          );
        })}
      </nav>
      <button
        onClick={() => logout().then(() => router.push("/"))}
        className="flex items-center gap-2 border-t border-white/10 px-5 py-3 text-[13px] text-white/70 hover:text-white"
      >
        <LogOut className="h-4 w-4" /> Гарах
      </button>
    </aside>
  );

  return (
    <div className="flex min-h-screen bg-background">
      <div className="hidden md:block">{side}</div>
      {open && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setOpen(false)} />
          <div className="relative z-50 h-full">{side}</div>
        </div>
      )}
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-14 items-center justify-between border-b border-[#E5E7EB] bg-white px-4">
          <div className="flex items-center gap-3">
            <button className="md:hidden" onClick={() => setOpen(true)}>
              <Menu className="h-5 w-5" />
            </button>
            <div className="text-sm font-medium">{client?.companyName || "Харилцагч"}</div>
          </div>
          <div className="flex items-center gap-2">
            <SearchCommand />
            <NotificationDropdown />
          </div>
        </header>
        <main className="flex-1 p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}
