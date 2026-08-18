"use client";

import { useEffect, useRef, useState } from "react";
import { ImagePlus, X } from "lucide-react";

export function ImagePicker({
  files,
  onChange,
  max = 8,
  label = "Зураг",
  hint,
  multiple = true,
}: {
  files: File[];
  onChange: (files: File[]) => void;
  max?: number;
  label?: string;
  hint?: string;
  multiple?: boolean;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [previews, setPreviews] = useState<string[]>([]);

  useEffect(() => {
    const urls = files.map((f) => URL.createObjectURL(f));
    setPreviews(urls);
    return () => urls.forEach((u) => URL.revokeObjectURL(u));
  }, [files]);

  function add(list: FileList | null) {
    if (!list) return;
    const picked = Array.from(list).filter((file) => file.type.startsWith("image/"));
    if (!picked.length) return;
    if (!multiple) {
      onChange(picked.slice(0, 1));
    } else {
      const next = [...files];
      for (const file of picked) {
        if (next.length >= max) break;
        next.push(file);
      }
      onChange(next);
    }
    if (inputRef.current) inputRef.current.value = "";
  }

  return (
    <div>
      <div className="mb-1.5 text-[13px] font-medium text-[#374151]">{label}</div>
      <div className="flex flex-wrap gap-2">
        {previews.map((src, i) => (
          <div key={`${files[i]?.name}-${i}`} className="relative h-20 w-20 overflow-hidden rounded-lg border border-[#E5E7EB]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={src} alt="" className="h-full w-full object-cover" />
            <button
              type="button"
              className="absolute right-1 top-1 rounded-full bg-black/60 p-0.5 text-white"
              onClick={() => onChange(files.filter((_, idx) => idx !== i))}
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        ))}
        {files.length < max && (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="flex h-20 w-20 flex-col items-center justify-center rounded-lg border border-dashed border-[#D1D5DB] text-[#6B7280] hover:border-primary hover:text-primary"
          >
            <ImagePlus className="h-5 w-5" />
            <span className="mt-1 text-[10px]">Нэмэх</span>
          </button>
        )}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        multiple={multiple && max > 1}
        className="hidden"
        onChange={(e) => add(e.target.files)}
      />
      <p className="mt-1 text-[12px] text-[#9CA3AF]">
        {hint || `JPG, PNG, WEBP, GIF · хамгийн ихдээ ${max} файл`}
      </p>
    </div>
  );
}

export function ImageGallery({ urls, className = "" }: { urls: string[]; className?: string }) {
  const images = urls.filter(Boolean);
  const [active, setActive] = useState(0);
  if (!images.length) return null;
  const current = images[Math.min(active, images.length - 1)];
  return (
    <div className={className}>
      <div className="overflow-hidden rounded-lg border border-[#E5E7EB] bg-[#F7F8F6]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={current} alt="" className="max-h-80 w-full object-contain" />
      </div>
      {images.length > 1 && (
        <div className="mt-2 flex flex-wrap gap-2">
          {images.map((url, i) => (
            <button
              key={url}
              type="button"
              onClick={() => setActive(i)}
              className={`h-14 w-14 overflow-hidden rounded-md border ${i === active ? "border-primary" : "border-[#E5E7EB]"}`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={url} alt="" className="h-full w-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export function isImageUrl(item: { url?: string; mime?: string; name?: string }) {
  if (item.mime?.startsWith("image/")) return true;
  return /\.(jpe?g|png|webp|gif)$/i.test(item.url || item.name || "");
}
