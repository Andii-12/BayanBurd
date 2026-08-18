import { AppFooter, AppHeader } from "@/components/public-shell";

export default function ContactPage() {
  return (
    <div>
      <AppHeader />
      <div className="mx-auto max-w-3xl px-4 py-12">
        <h1 className="text-2xl font-semibold">Холбоо барих</h1>
        <div className="card mt-6 space-y-2 p-5 text-sm">
          <p>Bayan Burd Eternity</p>
          <p className="text-[#6B7280]">Улаанбаатар, Монгол Улс</p>
          <p>Имэйл: hello@eternity.mn</p>
          <p>Утас: 7700-1122</p>
        </div>
      </div>
      <AppFooter />
    </div>
  );
}
