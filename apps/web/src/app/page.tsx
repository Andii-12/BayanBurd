import Link from "next/link";
import { AppFooter, AppHeader } from "@/components/public-shell";
import { Button } from "@/components/ui/button";
import { Monitor, Cpu, Printer, Network, Camera, Server, BatteryCharging, Globe, Workflow, Code2, KeyRound, Boxes, Plug } from "lucide-react";

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
      <section className="mx-auto max-w-7xl px-4 py-16">
        <h2 className="text-xl font-semibold">Худалдан авалтын дараа үргэлжилдэг хамтын ажиллагаа</h2>
        <p className="mt-2 max-w-2xl text-sm text-[#6B7280]">
          Asset бүртгэл, суурилуулалт, баталгаа, лиценз, засвар, issue tracking, үйлчилгээний түүх — бүгд нэг порталд.
        </p>
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {[
            ["Asset + Installation", "Худалдан авсан төхөөрөмж, систем таны бүртгэлд орно."],
            ["GitHub-style Issues", "Асуудлыг бүтээгдэхүүнтэй нь холбож нээнэ. Гар бичгээр бичих шаардлагагүй."],
            ["Warranty & Support", "Баталгаа, лиценз, дэмжлэгийн хугацааг нэг дороос хянана."],
          ].map(([t, d]) => (
            <div key={t} className="card p-5">
              <h3 className="text-sm font-semibold">{t}</h3>
              <p className="mt-2 text-sm text-[#6B7280]">{d}</p>
            </div>
          ))}
        </div>
      </section>
      <AppFooter />
    </div>
  );
}
