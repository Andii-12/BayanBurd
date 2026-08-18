import Link from "next/link";
import { AppFooter, AppHeader } from "@/components/public-shell";
import { Button } from "@/components/ui/button";
import {
  Monitor,
  Cpu,
  Printer,
  Network,
  Camera,
  Server,
  BatteryCharging,
  Globe,
  Workflow,
  Code2,
  KeyRound,
  Boxes,
  Plug,
  PackageCheck,
  CircleDot,
  ShieldCheck,
  ArrowRight,
} from "lucide-react";

export default function HomePage() {
  return (
    <div className="min-h-screen">
      <AppHeader />
      <section className="bg-primary-dark text-white">
        <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 py-16 lg:grid-cols-2 lg:py-24">
          <div>
            <p className="text-[13px] font-semibold tracking-[0.16em] text-orange">БИЗНЕСИЙН ТЕХНОЛОГИЙН ШИЙДЭЛ</p>
            <h1 className="mt-4 text-3xl font-semibold leading-tight md:text-5xl">
              Таны бизнесийг дэмжих технологийн найдвартай түнш
            </h1>
            <p className="mt-4 max-w-xl text-[15px] leading-relaxed text-white/75">
              Тоног төхөөрөмж, программ хангамж, веб систем, автоматжуулалт, суурилуулалт болон техникийн үйлчилгээний нэгдсэн шийдэл.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/products">
                <Button variant="orange" size="lg">
                  Бүтээгдэхүүн үзэх
                </Button>
              </Link>
              <Link href="/quotation">
                <Button variant="outline" size="lg" className="border-white/20 bg-transparent text-white hover:bg-white/10">
                  Үнийн санал авах
                </Button>
              </Link>
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-lg border border-white/10 bg-white/5 p-5">
              <div className="text-[12px] font-semibold tracking-wider text-orange">ТОНОГ ТӨХӨӨРӨМЖ</div>
              <ul className="mt-4 space-y-2 text-sm text-white/80">
                <li className="flex gap-2"><Monitor className="h-4 w-4 text-orange" /> Компьютер</li>
                <li className="flex gap-2"><Server className="h-4 w-4 text-orange" /> Сервер</li>
                <li className="flex gap-2"><Printer className="h-4 w-4 text-orange" /> Принтер</li>
                <li className="flex gap-2"><Network className="h-4 w-4 text-orange" /> Сүлжээ</li>
                <li className="flex gap-2"><Camera className="h-4 w-4 text-orange" /> Камер</li>
                <li className="flex gap-2"><Cpu className="h-4 w-4 text-orange" /> NVR</li>
                <li className="flex gap-2"><BatteryCharging className="h-4 w-4 text-orange" /> UPS</li>
              </ul>
            </div>
            <div className="rounded-lg border border-white/10 bg-white/5 p-5">
              <div className="text-[12px] font-semibold tracking-wider text-orange">ПРОГРАММ ХАНГАМЖ</div>
              <ul className="mt-4 space-y-2 text-sm text-white/80">
                <li className="flex gap-2"><Globe className="h-4 w-4 text-orange" /> Веб сайт</li>
                <li className="flex gap-2"><Workflow className="h-4 w-4 text-orange" /> Автоматжуулалтын систем</li>
                <li className="flex gap-2"><Code2 className="h-4 w-4 text-orange" /> Custom software</li>
                <li className="flex gap-2"><KeyRound className="h-4 w-4 text-orange" /> License</li>
                <li className="flex gap-2"><Boxes className="h-4 w-4 text-orange" /> ERP / CRM</li>
                <li className="flex gap-2"><Plug className="h-4 w-4 text-orange" /> API Integration</li>
              </ul>
            </div>
          </div>
        </div>
      </section>
      <section className="border-t border-[#E5E7EB] bg-white">
        <div className="mx-auto max-w-7xl px-4 py-16 lg:py-20">
          <p className="text-[13px] font-semibold tracking-[0.16em] text-orange">ХУДАЛДАН АВАЛТЫН ДАРАА</p>
          <h2 className="mt-3 max-w-2xl text-2xl font-semibold leading-tight md:text-3xl">
            Хамтын ажиллагаа үргэлжилдэг — бүгд нэг порталд
          </h2>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-[#6B7280]">
            Asset бүртгэл, суурилуулалт, баталгаа, лиценз, засвар, issue tracking, үйлчилгээний түүх.
          </p>

          <div className="mt-10 grid gap-4 md:grid-cols-3">
            {[
              {
                icon: PackageCheck,
                title: "Asset + Installation",
                body: "Худалдан авсан төхөөрөмж, систем таны бүртгэлд орно.",
                href: "/register",
              },
              {
                icon: CircleDot,
                title: "GitHub-style Issues",
                body: "Асуудлыг бүтээгдэхүүнтэй нь холбож нээнэ. Гар бичгээр бичих шаардлагагүй.",
                href: "/dashboard/issues",
              },
              {
                icon: ShieldCheck,
                title: "Warranty & Support",
                body: "Баталгаа, лиценз, дэмжлэгийн хугацааг нэг дороос хянана.",
                href: "/dashboard/warranty",
              },
            ].map((item) => (
              <Link key={item.title} href={item.href} className="card group p-6 transition hover:border-primary/30 hover:shadow-md">
                <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary-light text-primary">
                  <item.icon className="h-5 w-5" />
                </div>
                <h3 className="mt-4 text-sm font-semibold">{item.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-[#6B7280]">{item.body}</p>
                <span className="mt-4 inline-flex items-center gap-1 text-[13px] font-medium text-orange">
                  Дэлгэрэнгүй
                  <ArrowRight className="h-3.5 w-3.5 transition group-hover:translate-x-0.5" />
                </span>
              </Link>
            ))}
          </div>

          <ol className="mt-12 grid gap-3 sm:grid-cols-5">
            {[
              ["01", "Захиалга"],
              ["02", "Asset"],
              ["03", "Суурилуулалт"],
              ["04", "Issue"],
              ["05", "Үйлчилгээ"],
            ].map(([n, label], i) => (
              <li key={n} className="flex items-center gap-3 rounded-lg border border-[#E5E7EB] bg-[#F7F8F6] px-4 py-3">
                <span className="text-[12px] font-semibold text-orange">{n}</span>
                <span className="text-sm font-medium">{label}</span>
                {i < 4 && <ArrowRight className="ml-auto hidden h-3.5 w-3.5 text-[#D1D5DB] sm:block" />}
              </li>
            ))}
          </ol>
        </div>
      </section>
      <AppFooter />
    </div>
  );
}
