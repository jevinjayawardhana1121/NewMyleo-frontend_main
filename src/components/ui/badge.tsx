import * as React from "react";
import { cn } from "@/lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?:
    | "default"
    | "secondary"
    | "destructive"
    | "outline"
    | "success"
    | "warning"
    | "brand"
    | "gold";
  dot?: boolean;
}

function Badge({
  className,
  variant = "default",
  dot = false,
  children,
  ...props
}: BadgeProps) {
  const variants = {
    default:
      "border-transparent bg-slate-900 text-white shadow-soft-xs",
    secondary:
      "border-transparent bg-slate-100 text-slate-700",
    destructive:
      "bg-red-50 text-red-700 border border-red-200/80",
    outline:
      "text-slate-700 border border-slate-200/90 bg-white shadow-soft-xs",
    success:
      "bg-emerald-50 text-emerald-800 border border-emerald-200/80",
    warning:
      "bg-amber-50 text-amber-800 border border-amber-200/80",
    brand:
      "bg-brand-50 text-brand-700 border border-brand-200/80",
    gold:
      "bg-amber-100/70 text-amber-900 border border-amber-300/80 font-bold",
  };

  const dotColors = {
    default: "bg-white",
    secondary: "bg-slate-400",
    destructive: "bg-red-500",
    outline: "bg-slate-400",
    success: "bg-emerald-500",
    warning: "bg-amber-500",
    brand: "bg-brand-500",
    gold: "bg-amber-500",
  };

  return (
    <div
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold tracking-wide transition-all duration-150 select-none",
        variants[variant],
        className
      )}
      {...props}
    >
      {dot && (
        <span
          className={cn(
            "w-1.5 h-1.5 rounded-full animate-pulse-subtle shrink-0",
            dotColors[variant]
          )}
        />
      )}
      {children}
    </div>
  );
}

export { Badge };
