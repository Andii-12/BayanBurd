"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Logo } from "./logo";
import { LoginForm } from "./login-form";
import { useAuth, isStaff } from "@/lib/auth";
import { SearchCommand } from "./search-command";
import { NotificationDropdown } from "./notification-dropdown";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  ShoppingBag,
  Package,
  Tags,
  FileSpreadsheet,
  Building2,
  Boxes,
  Monitor,
  AppWindow,
  Wrench,
  Shield,
  KeyRound,
  CircleDot,
  History,
  Users,
  Bell,
  ScrollText,
  Settings,
  Menu,
  LogOut,
} from "lucide-react";

const groups = [
  {
    label: "",
    items: [{ href: "/admin", label: "Dashboard", icon: LayoutDashboard }],
  },
  {
    label: "БОРЛУУЛАЛТ",
    items: [
      { href: "/admin/orders", label: "Захиалгууд", icon: ShoppingBag },
      { href: "/admin/products", label: "Бүтээгдэхүүн", icon: Package },
      { href: "/admin/categories", label: "Ангилал", icon: Tags },
      { href: "/admin/quotations", label: "Үнийн санал", icon: FileSpreadsheet },
    ],
  },
  {
    label: "ХАРИЛЦАГЧ",
    items: [{ href: "/admin/clients", label: "Харилцагчид", icon: Building2 }],
  },
  {
    label: "ASSET MANAGEMENT",
    items: [
      { href: "/admin/assets", label: "Бүх Asset", icon: Boxes },
      { href: "/admin/devices", label: "Төхөөрөмж", icon: Monitor },
      { href: "/admin/systems", label: "Программ / Систем", icon: AppWindow },
      { href: "/admin/installations", label: "Суурилуулалт", icon: Wrench },
      { href: "/admin/warranty", label: "Баталгаа", icon: Shield },
      { href: "/admin/licenses", label: "Лиценз", icon: KeyRound },
    ],
  },
  {
    label: "SUPPORT",
    items: [
      { href: "/admin/issues", label: "Issues", icon: CircleDot },
      { href: "/admin/service-history", label: "Service History", icon: History },
    ],
  },
  {
    label: "SYSTEM",
    items: [
      { href: "/admin/users", label: "Users", icon: Users },
      { href: "/admin/notifications", label: "Notifications", icon: Bell },
      { href: "/admin/audit-logs", label: "Audit Logs", icon: ScrollText },
      { href: "/admin/settings", label: "Settings", icon: Settings },
    ],
  },
];

export function AdminShell({ children }: { children: React.ReactNode }) {
  const { user, loading, logout } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (loading || !user) return;
    if (!isStaff(user.role)) router.replace("/dashboard");
  }, [user, loading, router]);

  if (loading) return <div className="p-10 text-sm text-[#6B7280]">Ачааллаж байна...</div>;

  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-primary-dark px-4">
        <LoginForm mode="admin" />
      </div>
    );
  }

  if (!isStaff(user.role)) {
    return <div className="p-10 text-sm text-[#6B7280]">Ачааллаж байна...</div>;
  }

  const side = (
    <aside className="flex h-full w-[250px] flex-col bg-primary-dark text-white">
      <div className="border-b border-white/10 px-4 py-4">
        <Link href="/admin">
          <Logo light />
        </Link>
      </div>
      <nav className="flex-1 overflow-y-auto p-3 text-[13px]">
        {groups.map((g) => (
          <div key={g.label || "main"} className="mb-3">
            {g.label && (
              <div className="mb-1 px-3 text-[10px] font-semibold tracking-wider text-white/40">{g.label}</div>
            )}
            {g.items.map((it) => {
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
          </div>
        ))}
      </nav>
      <button
        onClick={() => logout().then(() => router.push("/"))}
        className="flex items-center gap-2 border-t border-white/10 px-5 py-3 text-[13px] text-white/70"
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
          <button className="md:hidden" onClick={() => setOpen(true)}>
            <Menu className="h-5 w-5" />
          </button>
          <div className="text-sm text-[#6B7280]">Admin · {user.firstName}</div>
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
