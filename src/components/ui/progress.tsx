import * as React from "react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { Check } from "lucide-react";

interface StepProgressProps {
  steps: { number: number; label: string }[];
  currentStep: number;
  onStepClick?: (step: number) => void;
  className?: string;
}

export function StepProgress({ steps, currentStep, onStepClick, className }: StepProgressProps) {
  const percentage = Math.min(100, Math.max(0, ((currentStep - 1) / (steps.length - 1)) * 100));

  return (
    <div className={cn("w-full py-4", className)}>
      <div className="relative mb-6">
        {/* Track */}
        <div className="absolute top-1/2 left-0 w-full -translate-y-1/2 h-1.5 bg-slate-200/80 rounded-full" />
        {/* Active Fill */}
        <motion.div
          className="absolute top-1/2 left-0 -translate-y-1/2 h-1.5 bg-gradient-to-r from-brand-600 via-brand-500 to-amber-400 rounded-full shadow-soft-xs"
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        />

        {/* Nodes */}
        <div className="relative flex justify-between">
          {steps.map((step) => {
            const isCompleted = step.number < currentStep;
            const isCurrent = step.number === currentStep;

            return (
              <motion.button
                key={step.number}
                type="button"
                whileHover={isCompleted || isCurrent ? { scale: 1.08 } : {}}
                whileTap={isCompleted || isCurrent ? { scale: 0.95 } : {}}
                disabled={!onStepClick || (!isCompleted && !isCurrent)}
                onClick={() => onStepClick && onStepClick(step.number)}
                className={cn(
                  "flex items-center justify-center w-10 h-10 rounded-2xl text-xs font-bold transition-all duration-200 border-2 select-none cursor-pointer",
                  isCompleted
                    ? "bg-brand-500 border-brand-500 text-white shadow-soft-xs"
                    : isCurrent
                    ? "bg-white border-brand-500 text-brand-600 ring-4 ring-brand-100 shadow-brand-glow scale-110"
                    : "bg-white border-slate-200 text-slate-400 cursor-not-allowed"
                )}
              >
                {isCompleted ? <Check className="w-4 h-4 stroke-[2.5]" /> : step.number}
              </motion.button>
            );
          })}
        </div>
      </div>

      <div className="flex justify-between px-1">
        {steps.map((step) => (
          <div
            key={step.number}
            className={cn(
              "text-[11px] font-bold text-center w-24 transition-colors tracking-tight",
              step.number === currentStep
                ? "text-brand-600 font-extrabold"
                : step.number < currentStep
                ? "text-slate-700"
                : "text-slate-400 font-medium"
            )}
          >
            {step.label}
          </div>
        ))}
      </div>
    </div>
  );
}
