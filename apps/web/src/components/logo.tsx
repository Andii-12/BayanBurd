import Image from "next/image";

export function Logo({ compact = false }: { light?: boolean; compact?: boolean }) {
  return (
    <Image
      src="/Logo.png"
      alt="Bayan Burd Eternity"
      width={180}
      height={60}
      priority
      className={compact ? "h-8 w-auto" : "h-10 w-auto"}
    />
  );
}
