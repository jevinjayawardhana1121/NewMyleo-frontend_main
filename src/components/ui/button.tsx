import * as React from "react";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?:
    | "default"
    | "brand"
    | "brand-gradient"
    | "destructive"
    | "outline"
    | "secondary"
    | "ghost"
    | "link"
    | "success"
    | "warning"
    | "gold";
  size?: "default" | "sm" | "lg" | "icon";
  loading?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "default",
      size = "default",
      loading = false,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    const base =
      "inline-flex items-center justify-center font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 select-none active:scale-[0.97] cursor-pointer";

    const variants = {
      default:
        "bg-slate-900 text-white hover:bg-slate-800 shadow-soft-xs hover:shadow-soft-sm",
      brand:
        "bg-brand-500 text-white hover:bg-brand-600 shadow-soft-xs hover:shadow-brand-glow hover:-translate-y-0.5",
      "brand-gradient":
        "bg-gradient-to-r from-brand-600 via-brand-500 to-brand-400 text-white shadow-soft-xs hover:shadow-brand-glow hover:-translate-y-0.5",
      gold:
        "bg-gradient-to-r from-amber-500 via-gold-500 to-amber-600 text-slate-900 font-bold shadow-soft-xs hover:shadow-amber-glow hover:-translate-y-0.5",
      destructive:
        "bg-red-600 text-white hover:bg-red-700 shadow-soft-xs hover:shadow-soft-sm",
      outline:
        "border border-slate-200/90 bg-white hover:bg-slate-50/80 text-slate-700 hover:text-slate-900 hover:border-slate-300 shadow-soft-xs hover:-translate-y-0.5",
      secondary:
        "bg-slate-100 text-slate-800 hover:bg-slate-200/80 hover:text-slate-900",
      ghost:
        "hover:bg-slate-100/80 text-slate-600 hover:text-slate-900",
      link:
        "text-brand-600 underline-offset-4 hover:underline !p-0 font-medium",
      success:
        "bg-emerald-600 text-white hover:bg-emerald-700 shadow-soft-xs hover:shadow-soft-sm",
      warning:
        "bg-amber-500 text-white hover:bg-amber-600 shadow-soft-xs hover:shadow-soft-sm",
    };

    const sizes = {
      default: "h-10 px-4 py-2 text-sm rounded-xl gap-2",
      sm: "h-8 px-3 text-xs rounded-lg gap-1.5",
      lg: "h-12 px-6 text-base rounded-2xl gap-2.5",
      icon: "h-9 w-9 rounded-xl",
    };

    return (
      <button
        className={cn(base, variants[variant], sizes[size], className)}
        ref={ref}
        disabled={disabled || loading}
        {...props}
      >
        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin shrink-0" />}
        {children}
      </button>
    );
  }
);
Button.displayName = "Button";

export { Button };
