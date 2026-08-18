"use client";

import { Button } from "@/components/ui/button";

export default function ErrorPage({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center px-4 text-center">
      <p className="font-medium">Мэдээлэл татах үед алдаа гарлаа.</p>
      <p className="mt-1 text-sm text-[#6B7280]">Дахин оролдоно уу.</p>
      <Button className="mt-4" onClick={reset}>
        Дахин оролдох
      </Button>
    </div>
  );
}
