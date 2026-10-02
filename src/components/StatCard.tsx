import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

export default function StatCard({
  label, value, icon: Icon, color = "blue",
}: {
  label: string;
  value: number | string;
  icon: LucideIcon;
  color?: "blue" | "green" | "amber" | "violet";
}) {
  const palette = {
    blue: "bg-blue-50 text-blue-600",
    green: "bg-emerald-50 text-emerald-600",
    amber: "bg-amber-50 text-amber-600",
    violet: "bg-violet-50 text-violet-600",
  }[color];

  return (
    <div className="card p-5 flex items-start justify-between">
      <div>
        <p className="text-xs font-medium text-ink-mute uppercase tracking-wide">{label}</p>
        <p className="text-3xl font-bold text-ink mt-2">{value}</p>
      </div>
      <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center", palette)}>
        <Icon size={20} />
      </div>
    </div>
  );
}