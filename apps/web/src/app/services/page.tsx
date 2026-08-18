import { AppFooter, AppHeader } from "@/components/public-shell";

export default function ServicesPage() {
  const items = [
    ["Суурилуулалт", "Төхөөрөмж, сүлжээ, сервер, камер, системийн суурилуулалт."],
    ["Засвар үйлчилгээ", "Hardware repair, сэлбэг солих, on-site инженерийн үйлчилгээ."],
    ["Техникийн дэмжлэг", "Issue tracking, remote support, SLA, 12 сарын дэмжлэг."],
    ["Программ / систем", "Веб, ERP/CRM, автоматжуулалт, API integration, license."],
  ];
  return (
    <div>
      <AppHeader />
      <div className="mx-auto max-w-5xl px-4 py-12">
        <h1 className="text-2xl font-semibold">Үйлчилгээ</h1>
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {items.map(([t, d]) => (
            <div key={t} className="card p-5">
              <h2 className="text-sm font-semibold">{t}</h2>
              <p className="mt-2 text-sm text-[#6B7280]">{d}</p>
            </div>
          ))}
        </div>
      </div>
      <AppFooter />
    </div>
  );
}
