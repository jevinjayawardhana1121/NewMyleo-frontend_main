import * as React from "react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface TabItem {
  id: string | number;
  label: string;
  count?: number;
  icon?: React.ReactNode;
}

interface TabsProps {
  tabs: TabItem[];
  activeTab: string | number;
  onChange: (id: string | number) => void;
  className?: string;
}

export function Tabs({ tabs, activeTab, onChange, className }: TabsProps) {
  return (
    <div
      className={cn(
        "flex flex-wrap items-center gap-1.5 p-1.5 bg-slate-200/60 backdrop-blur-md rounded-2xl w-fit border border-slate-300/40 shadow-inner",
        className
      )}
    >
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onChange(tab.id)}
            className={cn(
              "relative px-4 py-2 text-xs sm:text-sm font-semibold rounded-xl transition-all duration-200 flex items-center gap-2 select-none cursor-pointer",
              isActive
                ? "text-slate-900"
                : "text-slate-600 hover:text-slate-900 hover:bg-white/40"
            )}
          >
            {isActive && (
              <motion.div
                layoutId="active-tab-indicator"
                className="absolute inset-0 bg-white rounded-xl shadow-soft-sm border border-slate-200/80"
                transition={{ type: "spring", stiffness: 400, damping: 32 }}
              />
            )}
            <span className="relative z-10 flex items-center gap-2">
              {tab.icon}
              <span>{tab.label}</span>
              {tab.count !== undefined && (
                <span
                  className={cn(
                    "px-2 py-0.5 text-[11px] font-bold rounded-full transition-colors",
                    isActive
                      ? "bg-brand-50 text-brand-700 border border-brand-200"
                      : "bg-slate-300/60 text-slate-700"
                  )}
                >
                  {tab.count}
                </span>
              )}
            </span>
          </button>
        );
      })}
    </div>
  );
}
