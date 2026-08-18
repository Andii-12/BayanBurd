export function Logo({ light = false, compact = false }: { light?: boolean; compact?: boolean }) {
  return (
    <div className="flex items-center gap-2.5">
      <svg width="28" height="28" viewBox="0 0 32 32" fill="none">
        <rect width="32" height="32" rx="8" fill={light ? "#F7934C" : "#28521F"} />
        <path d="M8 21.5L16 8.5L24 21.5H8Z" fill="white" opacity="0.95" />
        <circle cx="16" cy="18.5" r="2.2" fill={light ? "#28521F" : "#F7934C"} />
      </svg>
      {!compact && (
        <div className="leading-tight">
          <div className={`text-[13px] font-semibold tracking-wide ${light ? "text-white" : "text-primary"}`}>
            BAYAN BURD
          </div>
          <div className={`text-[11px] ${light ? "text-white/70" : "text-[#6B7280]"}`}>ETERNITY</div>
        </div>
      )}
    </div>
  );
}
