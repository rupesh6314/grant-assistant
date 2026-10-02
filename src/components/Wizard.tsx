"use client";

import { Check } from "lucide-react";

const STEPS = ["Guidelines", "Application", "Supporting", "Review"];

export default function Wizard({
  step,
  onStepClick,
}: {
  step: number;
  onStepClick?: (n: number) => void;
}) {
  return (
    <div className="wizard-track flex items-center gap-2 overflow-x-auto">
      {STEPS.map((label, i) => {
        const n = i + 1;
        const done = n < step;
        const current = n === step;
        const clickable = onStepClick && n <= step;

        return (
          <div key={label} className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => clickable && onStepClick?.(n)}
              disabled={!clickable}
              className="flex items-center gap-2 shrink-0"
              style={{ cursor: clickable ? "pointer" : "default" }}
            >
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold border-2 shrink-0"
                style={{
                  background: done
                    ? "var(--brand)"
                    : current
                    ? "var(--bg-surface)"
                    : "var(--bg-surface-2)",
                  borderColor: done
                    ? "var(--brand)"
                    : current
                    ? "var(--brand)"
                    : "var(--border-strong)",
                  color: done
                    ? "#ffffff"
                    : current
                    ? "var(--brand)"
                    : "var(--text-muted)",
                }}
              >
                {done ? <Check size={14} /> : n}
              </div>
              <span
                className="wizard-step-label text-xs font-medium whitespace-nowrap"
                style={{
                  color:
                    current || done ? "var(--text-strong)" : "var(--text-muted)",
                }}
              >
                {label}
              </span>
            </button>

            {i < STEPS.length - 1 && (
              <div
                className="h-px w-6 sm:w-8 shrink-0"
                style={{
                  background: done ? "var(--brand)" : "var(--border)",
                }}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}