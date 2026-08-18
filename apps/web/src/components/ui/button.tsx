import { cn } from "@/lib/utils";
import { ButtonHTMLAttributes } from "react";

const variants: Record<string, string> = {
  primary: "bg-primary text-white hover:bg-primary-dark",
  orange: "bg-orange text-white hover:bg-orange-dark",
  outline: "border border-[#E5E7EB] bg-white hover:bg-[#F7F8F6] text-[#171717]",
  ghost: "hover:bg-primary-light text-primary",
  danger: "bg-danger text-white hover:bg-red-700",
};

const sizes: Record<string, string> = {
  sm: "h-8 px-3 text-[13px]",
  md: "h-10 px-4 text-sm",
  lg: "h-11 px-5 text-sm",
};

export function Button({
  className,
  variant = "primary",
  size = "md",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: keyof typeof variants; size?: keyof typeof sizes }) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-[10px] font-medium transition disabled:opacity-50",
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    />
  );
}
