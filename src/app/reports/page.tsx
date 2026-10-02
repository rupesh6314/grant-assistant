"use client";

import { useMemo, useState } from "react";
import Sidebar from "@/components/Sidebar";
import Topbar from "@/components/Topbar";
import { useStore } from "@/store/useStore";
import { cn } from "@/lib/utils";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, CartesianGrid, Legend,
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
  const { assessments, templates, documents } = useStore();
  const [range, setRange] = useState<"7d" | "30d" | "all">("30d");

  /* ── Status breakdown ───────────────── */
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

  /* ── Requirements breakdown across all assessments ── */
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

  /* ── Timeline: assessments created per day ── */
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

  /* ── Top missing requirements ── */
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
    <div className="flex min-h-screen bg-canvas">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Topbar breadcrumb={["Reports"]} />

        <main className="flex-1 p-6 lg:p-8 max-w-[1400px] w-full">
          <div className="flex items-start justify-between mb-8 flex-wrap gap-4">
            <div>
              <h1 className="text-2xl font-bold text-ink">Reports</h1>
              <p className="text-sm text-ink-mute mt-1">
                Aggregate analytics across all your assessments.
              </p>
            </div>
            <div className="flex gap-1 bg-white border border-line rounded-lg p-1">
              {(["7d", "30d", "all"] as const).map((r) => (
                <button
                  key={r}
                  onClick={() => setRange(r)}
                  className={cn(
                    "px-3 py-1.5 text-xs font-medium rounded-md transition-colors",
                    range === r
                      ? "bg-brand-600 text-white"
                      : "text-ink-mute hover:text-ink"
                  )}
                >
                  {r === "7d" ? "7 days" : r === "30d" ? "30 days" : "All time"}
                </button>
              ))}
            </div>
          </div>

          {!hasData ? (
            <div className="card p-12 text-center">
              <TrendingUp size={40} className="text-slate-300 mx-auto mb-3" />
              <p className="text-ink font-medium mb-1">No data yet</p>
              <p className="text-sm text-ink-mute">
                Create assessments to see analytics here.
              </p>
            </div>
          ) : (
            <>
              {/* KPI cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <KPI
                  label="Assessments"
                  value={totalAssessments}
                  sub={`${templates.length} templates · ${documents.length} docs`}
                  icon={FileText}
                  color="blue"
                />
                <KPI
                  label="Avg. Completeness"
                  value={`${avgCompleteness}%`}
                  sub="Across all assessments"
                  icon={CheckCircle2}
                  color="green"
                />
                <KPI
                  label="Total Requirements"
                  value={totalMappings}
                  sub="Mapped across documents"
                  icon={TrendingUp}
                  color="violet"
                />
                <KPI
                  label="Missing Evidence"
                  value={reqData.find((r) => r.name === "Missing")?.value || 0}
                  sub="Require follow-up"
                  icon={AlertTriangle}
                  color="amber"
                />
              </div>

              {/* Charts row 1 */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                {/* Timeline */}
                <div className="card p-6 lg:col-span-2">
                  <h2 className="text-base font-semibold text-ink mb-4">
                    Assessments over time
                  </h2>
                  <div style={{ width: "100%", height: 260 }}>
                    <ResponsiveContainer>
                      <LineChart data={timelineData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                        <XAxis
                          dataKey="date"
                          stroke="#64748b"
                          fontSize={11}
                          tickLine={false}
                        />
                        <YAxis
                          stroke="#64748b"
                          fontSize={11}
                          tickLine={false}
                          allowDecimals={false}
                        />
                        <Tooltip
                          contentStyle={{
                            border: "1px solid #e2e8f0",
                            borderRadius: 8,
                            fontSize: 12,
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

                {/* Status pie */}
                <div className="card p-6">
                  <h2 className="text-base font-semibold text-ink mb-4">
                    By status
                  </h2>
                  <div style={{ width: "100%", height: 260 }}>
                    <ResponsiveContainer>
                      <PieChart>
                        <Pie
                          data={statusData}
                          dataKey="value"
                          nameKey="name"
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={90}
                          paddingAngle={2}
                        >
                          {statusData.map((entry, i) => (
                            <Cell key={i} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip
                          contentStyle={{
                            border: "1px solid #e2e8f0",
                            borderRadius: 8,
                            fontSize: 12,
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

              {/* Charts row 2 */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                {/* Requirements breakdown */}
                <div className="card p-6">
                  <h2 className="text-base font-semibold text-ink mb-4">
                    Requirement evidence quality
                  </h2>
                  <div style={{ width: "100%", height: 260 }}>
                    <ResponsiveContainer>
                      <BarChart data={reqData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                        <XAxis
                          dataKey="name"
                          stroke="#64748b"
                          fontSize={11}
                          tickLine={false}
                        />
                        <YAxis
                          stroke="#64748b"
                          fontSize={11}
                          tickLine={false}
                          allowDecimals={false}
                        />
                        <Tooltip
                          contentStyle={{
                            border: "1px solid #e2e8f0",
                            borderRadius: 8,
                            fontSize: 12,
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

                {/* Top missing */}
                <div className="card p-6">
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
                          <span className="w-6 h-6 rounded-full bg-red-50 text-red-600 text-xs font-bold flex items-center justify-center shrink-0">
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

              {/* Assessment performance table */}
              <div className="card overflow-hidden">
                <div className="px-6 py-4 border-b border-line">
                  <h2 className="text-base font-semibold text-ink">
                    Assessment performance
                  </h2>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
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
                          <tr key={a.id} className="hover:bg-slate-50">
                            <td className="table-cell font-medium">{a.title}</td>
                            <td className="table-cell">
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
                            <td className="table-cell">
                              <div className="flex items-center gap-2">
                                <div className="w-16 h-1.5 rounded-full bg-slate-100 overflow-hidden">
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
                            <td className="table-cell">{a.mappings.length}</td>
                            <td className="table-cell">
                              {missing > 0 ? (
                                <span className="chip-danger">{missing}</span>
                              ) : (
                                <span className="text-ink-mute text-xs">—</span>
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
  label, value, sub, icon: Icon, color,
}: {
  label: string;
  value: number | string;
  sub: string;
  icon: any;
  color: "blue" | "green" | "amber" | "violet";
}) {
  const palette = {
    blue: "bg-blue-50 text-blue-600",
    green: "bg-emerald-50 text-emerald-600",
    amber: "bg-amber-50 text-amber-600",
    violet: "bg-violet-50 text-violet-600",
  }[color];

  return (
    <div className="card p-5">
      <div className="flex items-start justify-between mb-3">
        <p className="text-xs font-medium text-ink-mute uppercase tracking-wide">
          {label}
        </p>
        <div className={cn("w-9 h-9 rounded-lg flex items-center justify-center", palette)}>
          <Icon size={16} />
        </div>
      </div>
      <p className="text-2xl font-bold text-ink">{value}</p>
      <p className="text-xs text-ink-mute mt-1">{sub}</p>
    </div>
  );
}