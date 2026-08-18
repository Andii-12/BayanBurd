import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
      <h1 className="text-2xl font-semibold">Хуудас олдсонгүй</h1>
      <p className="mt-2 text-sm text-[#6B7280]">Таны хайсан хуудас байхгүй байна.</p>
      <Link href="/" className="mt-4 text-sm text-primary">
        Нүүр хуудас
      </Link>
    </div>
  );
}
