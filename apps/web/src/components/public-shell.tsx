"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo } from "./logo";
import { SearchCommand } from "./search-command";
import { NotificationDropdown } from "./notification-dropdown";
import { useAuth, isStaff } from "@/lib/auth";
import { useCart } from "@/lib/cart";
import { ShoppingCart, Menu, X } from "lucide-react";
import { useState } from "react";
import { Button } from "./ui/button";
import { cn } from "@/lib/utils";

const nav = [
  { href: "/", label: "Нүүр" },
  { href: "/products?productType=HARDWARE", label: "Тоног төхөөрөмж" },
  { href: "/products?productType=SOFTWARE", label: "Программ хангамж" },
  { href: "/services", label: "Үйлчилгээ" },
  { href: "/quotation", label: "Үнийн санал" },
  { href: "/contact", label: "Холбоо барих" },
];

export function AppHeader() {
  const pathname = usePathname();
  const { user } = useAuth();
  const { count } = useCart();
  const [open, setOpen] = useState(false);
  const dash = user ? (isStaff(user.role) ? "/admin" : "/dashboard") : "/login";

  return (
    <header className="sticky top-0 z-30 border-b border-[#E5E7EB] bg-white/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
        <Link href="/">
          <Logo />
        </Link>
        <nav className="hidden items-center gap-6 text-sm lg:flex">
          {nav.map((n) => (
            <Link
              key={n.href}
              href={n.href}
              className={cn(
                "text-[#374151] hover:text-primary",
                pathname === n.href && "font-medium text-primary"
              )}
            >
              {n.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <SearchCommand />
          <Link href="/cart" className="relative rounded-lg p-2 hover:bg-primary-light">
            <ShoppingCart className="h-5 w-5" />
            {count > 0 && (
              <span className="absolute right-1 top-1 h-4 min-w-4 rounded-full bg-orange text-center text-[10px] font-semibold text-white">
                {count}
              </span>
            )}
          </Link>
          <NotificationDropdown />
          {user ? (
            <Link href={dash}>
              <Button size="sm">{isStaff(user.role) ? "Admin" : "Хураангуй"}</Button>
            </Link>
          ) : (
            <Link href="/login">
              <Button size="sm">Нэвтрэх</Button>
            </Link>
          )}
          <button className="lg:hidden" onClick={() => setOpen((v) => !v)}>
            {open ? <X /> : <Menu />}
          </button>
        </div>
      </div>
      {open && (
        <div className="border-t border-[#E5E7EB] bg-white px-4 py-3 lg:hidden">
          {nav.map((n) => (
            <Link key={n.href} href={n.href} className="block py-2 text-sm" onClick={() => setOpen(false)}>
              {n.label}
            </Link>
          ))}
        </div>
      )}
    </header>
  );
}

export function AppFooter() {
  return (
    <footer className="mt-16 border-t border-[#E5E7EB] bg-primary-dark text-white">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <Logo light />
          <p className="mt-3 text-sm text-white/70">
            Бизнесийн технологийн нэгдсэн шийдэл — төхөөрөмж, систем, суурилуулалт, дэмжлэг.
          </p>
        </div>
        <div>
          <h4 className="mb-3 text-sm font-semibold">Бүтээгдэхүүн</h4>
          <ul className="space-y-2 text-sm text-white/75">
            <li><Link href="/products?productType=HARDWARE">Тоног төхөөрөмж</Link></li>
            <li><Link href="/products?productType=SOFTWARE">Программ хангамж</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="mb-3 text-sm font-semibold">Үйлчилгээ</h4>
          <ul className="space-y-2 text-sm text-white/75">
            <li><Link href="/services">Суурилуулалт</Link></li>
            <li><Link href="/services">Засвар үйлчилгээ</Link></li>
            <li><Link href="/services">Техникийн дэмжлэг</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="mb-3 text-sm font-semibold">Тусламж</h4>
          <ul className="space-y-2 text-sm text-white/75">
            <li><Link href="/dashboard/issues">Issues</Link></li>
            <li><Link href="/contact">Холбоо барих</Link></li>
            <li><Link href="/quotation">Үнийн санал</Link></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10 py-4 text-center text-[12px] text-white/50">
        © {new Date().getFullYear()} Bayan Burd Eternity. Компанийн мэдээлэл.
      </div>
    </footer>
  );
}
