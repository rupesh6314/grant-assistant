"use client";

import { useRouter } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import Topbar from "@/components/Topbar";
import StatCard from "@/components/StatCard";
import Donut from "@/components/Donut";
import { useStore } from "@/store/useStore";
import { cn, formatDate } from "@/lib/utils";
import { FileText, CheckCircle2, Clock, FileEdit, Plus } from "lucide-react";

const primaryButtonStyle: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  gap: "0.5rem",
  padding: "0.625rem 1.125rem",
  background: "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)",
  color: "#ffffff",
  fontSize: "0.875rem",
  fontWeight: 600,
  lineHeight: "1.25rem",
  borderRadius: "10px",
  border: "1px solid #2563eb",
  boxShadow:
    "0 4px 14px -3px rgba(37, 99, 235, 0.45), inset 0 1px 0 rgba(255,255,255,0.15)",
  cursor: "pointer",
  textDecoration: "none",
  whiteSpace: "nowrap",
  transition: "transform 150ms ease, box-shadow 150ms ease",
};

const hoverOn = (e: React.MouseEvent<HTMLButtonElement>) => {
  e.currentTarget.style.transform = "translateY(-1px)";
  e.currentTarget.style.boxShadow =
    "0 8px 20px -3px rgba(37, 99, 235, 0.55), inset 0 1px 0 rgba(255,255,255,0.2)";
};

const hoverOff = (e: React.MouseEvent<HTMLButtonElement>) => {
  e.currentTarget.style.transform = "translateY(0)";
  e.currentTarget.style.boxShadow =
    "0 4px 14px -3px rgba(37, 99, 235, 0.45), inset 0 1px 0 rgba(255,255,255,0.15)";
};

export default function Dashboard() {
  const router = useRouter();
  const assessments = useStore((s) => s.assessments);
  const setCurrent = useStore((s) => s.setCurrent);
  const userName = useStore((s) => s.preferences.name);

  const total = assessments.length;
  const completed = assessments.filter((a) => a.status === "completed").length;
  const inReview = assessments.filter((a) => a.status === "in-review").length;
  const drafts = assessments.filter((a) => a.status === "draft").length;

  const avgCompleteness =
    total === 0
      ? 0
      : Math.round(
          assessments.reduce((sum, a) => sum + a.completeness, 0) / total
        );

  const supported = assessments.reduce(
    (n, a) => n + a.mappings.filter((m) => m.status === "accepted").length,
    0
  );
  const needsReview = assessments.reduce(
    (n, a) =>
      n +
      a.mappings.filter((m) =>
        ["pending", "weak", "ambiguous"].includes(m.status)
      ).length,
    0
  );
  const missing = assessments.reduce(
    (n, a) => n + a.mappings.filter((m) => m.status === "missing").length,
    0
  );

  const firstName = userName.split(" ")[0] || "there";

  return (
    <div className="flex min-h-screen app-shell">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Topbar breadcrumb={["Dashboard"]} />

        <main className="app-content flex-1 p-4 sm:p-6 lg:p-8 max-w-[1400px] w-full">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-6 sm:mb-8 gap-3 sm:gap-4">
            <div>
              <h1 className="text-2xl font-bold text-ink">
                Welcome back, {firstName}
              </h1>
              <p className="text-sm text-ink-mute mt-1">
                Review and analyze grant applications with AI-powered evidence
                checking.
              </p>
            </div>
            <button
              onClick={() => router.push("/new")}
              style={primaryButtonStyle}
              onMouseEnter={hoverOn}
              onMouseLeave={hoverOff}
            >
              <Plus size={16} />
              New Assessment
            </button>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
            <StatCard label="Total" value={total} icon={FileText} color="blue" />
            <StatCard label="Completed" value={completed} icon={CheckCircle2} color="green" />
            <StatCard label="In Review" value={inReview} icon={Clock} color="amber" />
            <StatCard label="Drafts" value={drafts} icon={FileEdit} color="violet" />
          </div>

          <div className="card mb-6 sm:mb-8 !p-0 overflow-hidden">
            <div
              className="px-4 sm:px-6 py-4 border-b"
              style={{ borderColor: "var(--border)" }}
            >
              <h2 className="text-base font-semibold text-ink">
                Recent Assessments
              </h2>
            </div>
            {assessments.length === 0 ? (
              <div className="text-center py-12 sm:py-16 px-4">
                <FileText
                  size={40}
                  className="mx-auto mb-3"
                  style={{ color: "var(--text-muted)" }}
                />
                <p className="text-ink font-medium">No assessments yet</p>
                <p className="text-sm text-ink-mute mb-4">
                  Create your first one to see it here.
                </p>
                <button
                  onClick={() => router.push("/new")}
                  style={{ ...primaryButtonStyle, marginTop: "0.5rem" }}
                  onMouseEnter={hoverOn}
                  onMouseLeave={hoverOff}
                >
                  <Plus size={16} /> New Assessment
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full mobile-cards">
                  <thead>
                    <tr>
                      <th className="table-head">Title</th>
                      <th className="table-head">Status</th>
                      <th className="table-head">Completeness</th>
                      <th className="table-head">Updated</th>
                    </tr>
                  </thead>
                  <tbody>
                    {assessments.slice(0, 10).map((a) => (
                      <tr
                        key={a.id}
                        onClick={() => {
                          setCurrent(a.id);
                          router.push("/results");
                        }}
                        className="cursor-pointer"
                        onMouseEnter={(e) =>
                          (e.currentTarget.style.background = "var(--bg-hover)")
                        }
                        onMouseLeave={(e) =>
                          (e.currentTarget.style.background = "transparent")
                        }
                      >
                        <td className="table-cell font-medium">{a.title}</td>
                        <td className="table-cell" data-label="Status">
                          <StatusChip status={a.status} />
                        </td>
                        <td className="table-cell" data-label="Completeness">
                          <div className="flex items-center gap-3">
                            <div
                              className="w-24 h-1.5 rounded-full overflow-hidden"
                              style={{ background: "var(--border)" }}
                            >
                              <div
                                className={cn(
                                  "h-full rounded-full",
                                  a.completeness >= 80
                                    ? "bg-emerald-500"
                                    : a.completeness >= 50
                                    ? "bg-amber-500"
                                    : a.completeness > 0
                                    ? "bg-blue-500"
                                    : "bg-slate-500"
                                )}
                                style={{ width: `${a.completeness}%` }}
                              />
                            </div>
                            <span className="text-xs text-ink-mute font-medium">
                              {a.completeness}%
                            </span>
                          </div>
                        </td>
                        <td className="table-cell text-ink-mute" data-label="Updated">
                          {formatDate(a.updatedAt)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            <div className="card">
              <h2 className="text-base font-semibold text-ink mb-4">
                Completion Overview
              </h2>
              <div className="flex flex-col sm:flex-row items-center gap-6 sm:gap-8">
                <Donut percent={avgCompleteness} />
                <ul className="space-y-3 text-sm w-full sm:flex-1">
                  <Legend color="#10b981" label="Supported" value={supported} />
                  <Legend color="#f59e0b" label="Needs review" value={needsReview} />
                  <Legend color="#ef4444" label="Missing" value={missing} />
                </ul>
              </div>
            </div>

            <div className="card">
              <h2 className="text-base font-semibold text-ink mb-4">
                Recent Activity
              </h2>
              {assessments.length === 0 ? (
                <p className="text-sm text-ink-mute">No activity yet.</p>
              ) : (
                <ul className="space-y-3">
                  {assessments.slice(0, 4).map((a) => (
                    <li
                      key={a.id}
                      className="flex items-center gap-3 text-sm pb-3 last:border-0 last:pb-0 border-b"
                      style={{ borderColor: "var(--border)" }}
                    >
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
                        style={{
                          background: "var(--bg-hover)",
                          color: "var(--text-muted)",
                        }}
                      >
                        <Clock size={14} />
                      </div>
                      <span className="text-ink-soft truncate">{a.title}</span>
                      <span className="ml-auto text-xs text-ink-mute shrink-0">
                        {formatDate(a.updatedAt)}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

function StatusChip({ status }: { status: string }) {
  if (status === "completed")
    return <span className="chip chip-success">Completed</span>;
  if (status === "in-review")
    return <span className="chip chip-warning">In review</span>;
  if (status === "draft") return <span className="chip chip-neutral">Draft</span>;
  return <span className="chip chip-neutral">{status}</span>;
}

function Legend({
  color,
  label,
  value,
}: {
  color: string;
  label: string;
  value: number;
}) {
  return (
    <li className="flex items-center gap-3">
      <span
        className="w-2.5 h-2.5 rounded-full"
        style={{ background: color }}
      />
      <span className="text-ink-soft">{label}</span>
      <span className="ml-auto font-semibold text-ink">{value}</span>
    </li>
  );
}