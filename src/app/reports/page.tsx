"use client";

import { useMemo, useState } from "react";
import Sidebar from "@/components/Sidebar";
import Topbar from "@/components/Topbar";
import { useStore } from "@/store/useStore";
import { cn } from "@/lib/utils";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  CartesianGrid,
} from "recharts";
import { TrendingUp, FileText, CheckCircle2, AlertTriangle } from "lucide-react";

const COLORS = {
  emerald: "#10b981",
  amber: "#f59e0b",
  red: "#ef4444",
  blue: "#3b82f6",
  violet: "#8b5cf6",
  slate: "#94a3b8",
};

export default function ReportsPage() {
  const assessments = useStore((s) => s.assessments);
  const templates = useStore((s) => s.templates);
  const documents = useStore((s) => s.documents);

  const [range, setRange] = useState<"7d" | "30d" | "all">("30d");

  const statusData = useMemo(() => {
    const counts = { draft: 0, "in-review": 0, completed: 0 };
    assessments.forEach((a) => {
      counts[a.status]++;
    });
    return [
      { name: "Completed", value: counts.completed, color: COLORS.emerald },
      { name: "In Review", value: counts["in-review"], color: COLORS.amber },
      { name: "Draft", value: counts.draft, color: COLORS.slate },
    ].filter((d) => d.value > 0);
  }, [assessments]);

  const reqData = useMemo(() => {
    const counts = { accepted: 0, pending: 0, weak: 0, missing: 0, rejected: 0 };
    assessments.forEach((a) => {
      a.mappings.forEach((m) => {
        if (m.status === "accepted") counts.accepted++;
        else if (m.status === "missing") counts.missing++;
        else if (m.status === "weak" || m.status === "ambiguous") counts.weak++;
        else if (m.status === "rejected") counts.rejected++;
        else counts.pending++;
      });
    });
    return [
      { name: "Supported", value: counts.accepted, color: COLORS.emerald },
      { name: "Pending", value: counts.pending, color: COLORS.blue },
      { name: "Weak", value: counts.weak, color: COLORS.amber },
      { name: "Missing", value: counts.missing, color: COLORS.red },
      { name: "Rejected", value: counts.rejected, color: COLORS.slate },
    ].filter((d) => d.value > 0);
  }, [assessments]);

  const timelineData = useMemo(() => {
    const now = new Date();
    const days = range === "7d" ? 7 : range === "30d" ? 30 : 90;
    const buckets: Record<string, number> = {};
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const key = d.toISOString().slice(0, 10);
      buckets[key] = 0;
    }
    assessments.forEach((a) => {
      const key = a.createdAt.slice(0, 10);
      if (key in buckets) buckets[key]++;
    });
    return Object.entries(buckets).map(([date, count]) => ({
      date: date.slice(5),
      count,
    }));
  }, [assessments, range]);

  const topMissing = useMemo(() => {
    const counts: Record<string, { text: string; count: number }> = {};
    assessments.forEach((a) => {
      a.mappings
        .filter((m) => m.status === "missing")
        .forEach((m) => {
          const key = m.requirementText.slice(0, 80);
          if (!counts[key]) counts[key] = { text: key, count: 0 };
          counts[key].count++;
        });
    });
    return Object.values(counts)
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }, [assessments]);

  const totalAssessments = assessments.length;
  const totalMappings = assessments.reduce((n, a) => n + a.mappings.length, 0);
  const avgCompleteness =
    totalAssessments === 0
      ? 0
      : Math.round(
          assessments.reduce((n, a) => n + a.completeness, 0) / totalAssessments
        );

  const hasData = totalAssessments > 0;

  return (
    <div className="flex min-h-screen app-shell">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Topbar breadcrumb={["Reports"]} />

        <main className="app-content flex-1 p-4 sm:p-6 lg:p-8 max-w-[1400px] w-full">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-6 sm:mb-8 gap-3 sm:gap-4">
            <div>
              <h1 className="text-2xl font-bold text-ink">Reports</h1>
              <p className="text-sm text-ink-mute mt-1">
                Aggregate analytics across all your assessments.
              </p>
            </div>
            <div
              className="flex gap-1 rounded-lg p-1 border self-start"
              style={{
                background: "var(--bg-surface)",
                borderColor: "var(--border)",
              }}
            >
              {(["7d", "30d", "all"] as const).map((r) => (
                <button
                  key={r}
                  onClick={() => setRange(r)}
                  className="px-3 py-1.5 text-xs font-medium rounded-md transition-colors"
                  style={{
                    background: range === r ? "var(--brand)" : "transparent",
                    color: range === r ? "#ffffff" : "var(--text-muted)",
                  }}
                >
                  {r === "7d" ? "7 days" : r === "30d" ? "30 days" : "All"}
                </button>
              ))}
            </div>
          </div>

          {!hasData ? (
            <div className="card !p-8 sm:!p-12 text-center">
              <TrendingUp
                size={40}
                className="mx-auto mb-3"
                style={{ color: "var(--text-muted)" }}
              />
              <p className="text-ink font-medium mb-1">No data yet</p>
              <p className="text-sm text-ink-mute">
                Create assessments to see analytics here.
              </p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
                <KPI
                  label="Assessments"
                  value={totalAssessments}
                  sub={`${templates.length} templates`}
                  icon={FileText}
                  color="blue"
                />
                <KPI
                  label="Avg. Completeness"
                  value={`${avgCompleteness}%`}
                  sub="Across all"
                  icon={CheckCircle2}
                  color="green"
                />
                <KPI
                  label="Total Requirements"
                  value={totalMappings}
                  sub="Mapped"
                  icon={TrendingUp}
                  color="violet"
                />
                <KPI
                  label="Missing"
                  value={reqData.find((r) => r.name === "Missing")?.value || 0}
                  sub="Follow-up"
                  icon={AlertTriangle}
                  color="amber"
                />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 mb-6">
                <div className="card lg:col-span-2">
                  <h2 className="text-base font-semibold text-ink mb-4">
                    Assessments over time
                  </h2>
                  <div style={{ width: "100%", height: 240 }}>
                    <ResponsiveContainer>
                      <LineChart data={timelineData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                        <XAxis
                          dataKey="date"
                          stroke="var(--text-muted)"
                          fontSize={10}
                          tickLine={false}
                        />
                        <YAxis
                          stroke="var(--text-muted)"
                          fontSize={10}
                          tickLine={false}
                          allowDecimals={false}
                        />
                        <Tooltip
                          contentStyle={{
                            background: "var(--bg-surface)",
                            border: "1px solid var(--border)",
                            borderRadius: 8,
                            fontSize: 12,
                            color: "var(--text-strong)",
                          }}
                        />
                        <Line
                          type="monotone"
                          dataKey="count"
                          stroke={COLORS.blue}
                          strokeWidth={2}
                          dot={{ r: 3 }}
                          activeDot={{ r: 5 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="card">
                  <h2 className="text-base font-semibold text-ink mb-4">
                    By status
                  </h2>
                  <div style={{ width: "100%", height: 240 }}>
                    <ResponsiveContainer>
                      <PieChart>
                        <Pie
                          data={statusData}
                          dataKey="value"
                          nameKey="name"
                          cx="50%"
                          cy="50%"
                          innerRadius={50}
                          outerRadius={80}
                          paddingAngle={2}
                        >
                          {statusData.map((entry, i) => (
                            <Cell key={i} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip
                          contentStyle={{
                            background: "var(--bg-surface)",
                            border: "1px solid var(--border)",
                            borderRadius: 8,
                            fontSize: 12,
                            color: "var(--text-strong)",
                          }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="space-y-2 mt-2">
                    {statusData.map((s) => (
                      <div
                        key={s.name}
                        className="flex items-center gap-2 text-xs"
                      >
                        <span
                          className="w-2.5 h-2.5 rounded-full"
                          style={{ background: s.color }}
                        />
                        <span className="text-ink-soft">{s.name}</span>
                        <span className="ml-auto font-semibold text-ink">
                          {s.value}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-6">
                <div className="card">
                  <h2 className="text-base font-semibold text-ink mb-4">
                    Evidence quality
                  </h2>
                  <div style={{ width: "100%", height: 240 }}>
                    <ResponsiveContainer>
                      <BarChart data={reqData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                        <XAxis
                          dataKey="name"
                          stroke="var(--text-muted)"
                          fontSize={10}
                          tickLine={false}
                        />
                        <YAxis
                          stroke="var(--text-muted)"
                          fontSize={10}
                          tickLine={false}
                          allowDecimals={false}
                        />
                        <Tooltip
                          contentStyle={{
                            background: "var(--bg-surface)",
                            border: "1px solid var(--border)",
                            borderRadius: 8,
                            fontSize: 12,
                            color: "var(--text-strong)",
                          }}
                        />
                        <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                          {reqData.map((entry, i) => (
                            <Cell key={i} fill={entry.color} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="card">
                  <h2 className="text-base font-semibold text-ink mb-4">
                    Top missing requirements
                  </h2>
                  {topMissing.length === 0 ? (
                    <p className="text-sm text-ink-mute py-12 text-center">
                      No missing requirements — great work!
                    </p>
                  ) : (
                    <ul className="space-y-3">
                      {topMissing.map((m, i) => (
                        <li key={i} className="flex items-start gap-3">
                          <span
                            className="w-6 h-6 rounded-full text-xs font-bold flex items-center justify-center shrink-0"
                            style={{
                              background: "var(--danger-soft)",
                              color: "var(--danger)",
                            }}
                          >
                            {m.count}
                          </span>
                          <p className="text-sm text-ink-soft line-clamp-2">
                            {m.text}
                          </p>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>

              <div className="card !p-0 overflow-hidden">
                <div
                  className="px-4 sm:px-6 py-4 border-b"
                  style={{ borderColor: "var(--border)" }}
                >
                  <h2 className="text-base font-semibold text-ink">
                    Assessment performance
                  </h2>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full mobile-cards">
                    <thead>
                      <tr>
                        <th className="table-head">Title</th>
                        <th className="table-head w-28">Status</th>
                        <th className="table-head w-32">Completeness</th>
                        <th className="table-head w-28">Requirements</th>
                        <th className="table-head w-28">Missing</th>
                      </tr>
                    </thead>
                    <tbody>
                      {assessments.slice(0, 10).map((a) => {
                        const missing = a.mappings.filter(
                          (m) => m.status === "missing"
                        ).length;
                        return (
                          <tr key={a.id}>
                            <td className="table-cell font-medium">{a.title}</td>
                            <td className="table-cell" data-label="Status">
                              <span
                                className={cn(
                                  "chip",
                                  a.status === "completed"
                                    ? "chip-success"
                                    : a.status === "in-review"
                                    ? "chip-warning"
                                    : "chip-neutral"
                                )}
                              >
                                {a.status}
                              </span>
                            </td>
                            <td className="table-cell" data-label="Completeness">
                              <div className="flex items-center gap-2">
                                <div
                                  className="w-16 h-1.5 rounded-full overflow-hidden"
                                  style={{ background: "var(--border)" }}
                                >
                                  <div
                                    className={cn(
                                      "h-full rounded-full",
                                      a.completeness >= 80
                                        ? "bg-emerald-500"
                                        : a.completeness >= 50
                                        ? "bg-amber-500"
                                        : "bg-blue-500"
                                    )}
                                    style={{ width: `${a.completeness}%` }}
                                  />
                                </div>
                                <span className="text-xs font-medium text-ink-mute">
                                  {a.completeness}%
                                </span>
                              </div>
                            </td>
                            <td className="table-cell" data-label="Requirements">
                              {a.mappings.length}
                            </td>
                            <td className="table-cell" data-label="Missing">
                              {missing > 0 ? (
                                <span className="chip chip-danger">{missing}</span>
                              ) : (
                                <span className="text-xs text-ink-mute">—</span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  );
}

function KPI({
  label,
  value,
  sub,
  icon: Icon,
  color,
}: {
  label: string;
  value: number | string;
  sub: string;
  icon: any;
  color: "blue" | "green" | "amber" | "violet";
}) {
  const palettes = {
    blue: { bg: "rgba(59, 130, 246, 0.15)", fg: "#3b82f6" },
    green: { bg: "rgba(16, 185, 129, 0.15)", fg: "#10b981" },
    amber: { bg: "rgba(245, 158, 11, 0.15)", fg: "#f59e0b" },
    violet: { bg: "rgba(139, 92, 246, 0.15)", fg: "#8b5cf6" },
  };
  const palette = palettes[color];

  return (
    <div className="card">
      <div className="flex items-start justify-between mb-2">
        <p className="text-[10px] sm:text-xs font-medium text-ink-mute uppercase tracking-wide">
          {label}
        </p>
        <div
          className="w-7 h-7 sm:w-9 sm:h-9 rounded-lg flex items-center justify-center shrink-0"
          style={{ background: palette.bg, color: palette.fg }}
        >
          <Icon size={14} />
        </div>
      </div>
      <p className="text-xl sm:text-2xl font-bold text-ink">{value}</p>
      <p className="text-[10px] sm:text-xs text-ink-mute mt-1 truncate">{sub}</p>
    </div>
  );
}