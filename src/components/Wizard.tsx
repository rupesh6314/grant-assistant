"use client";

import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

const STEPS = ["Guidelines", "Application", "Supporting Documents", "Review"];

export default function Wizard({
  step, onStepClick,
}: {
  step: number;
  onStepClick?: (n: number) => void;
}) {
  return (
    <div className="flex items-center gap-2">
      {STEPS.map((label, i) => {
        const n = i + 1;
        const done = n < step;
        const current = n === step;
        return (
          <div key={label} className="flex items-center gap-2 flex-1">
            <button
              onClick={() => onStepClick?.(n)}
              disabled={!onStepClick || n > step}
              className={cn("flex items-center gap-2 shrink-0", onStepClick && n <= step && "cursor-pointer")}
            >
              <div
                className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold border-2 transition-all",
                  done && "bg-brand-600 border-brand-600 text-white",
                  current && "border-brand-600 text-brand-600 bg-white",
                  !done && !current && "border-line text-ink-mute bg-white"
                )}
              >
                {done ? <Check size={14} /> : n}
              </div>
              <span className={cn("text-xs font-medium whitespace-nowrap", (current || done) ? "text-ink" : "text-ink-mute")}>
                {label}
              </span>
            </button>
            {i < STEPS.length - 1 && <div className={cn("h-px flex-1", done ? "bg-brand-600" : "bg-line")} />}
          </div>
        );
      })}
    </div>
  );
}