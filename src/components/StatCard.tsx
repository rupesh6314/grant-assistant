import { LucideIcon } from "lucide-react";

export default function StatCard({
  label,
  value,
  icon: Icon,
  color = "blue",
}: {
  label: string;
  value: number | string;
  icon: LucideIcon;
  color?: "blue" | "green" | "amber" | "violet";
}) {
  const palettes = {
    blue: { bg: "rgba(59, 130, 246, 0.15)", fg: "#3b82f6" },
    green: { bg: "rgba(16, 185, 129, 0.15)", fg: "#10b981" },
    amber: { bg: "rgba(245, 158, 11, 0.15)", fg: "#f59e0b" },
    violet: { bg: "rgba(139, 92, 246, 0.15)", fg: "#8b5cf6" },
  };
  const palette = palettes[color];

  return (
    <div className="card flex items-start justify-between">
      <div>
        <p className="text-xs font-medium text-ink-mute uppercase tracking-wide">
          {label}
        </p>
        <p className="text-3xl font-bold text-ink mt-2">{value}</p>
      </div>
      <div
        className="w-10 h-10 rounded-lg flex items-center justify-center"
        style={{ background: palette.bg, color: palette.fg }}
      >
        <Icon size={20} />
      </div>
    </div>
  );
}