"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import Sidebar from "@/components/Sidebar";
import Topbar from "@/components/Topbar";
import Donut from "@/components/Donut";
import { useStore } from "@/store/useStore";
import { cn, formatDate } from "@/lib/utils";
import { CheckCircle2, XCircle, AlertTriangle, X, RotateCcw, Trash2 } from "lucide-react";
import type { Mapping } from "@/types";

const TABS = [
  "Overview",
  "Requirements",
  "Missing Documents",
  "Clarification Questions",
  "Audit Trail",
];

export default function ResultsPage() {
  const router = useRouter();
  const assessments = useStore((s) => s.assessments);
  const currentId = useStore((s) => s.currentId);
  const updateAssessment = useStore((s) => s.updateAssessment);
  const deleteAssessment = useStore((s) => s.deleteAssessment);

  const [tab, setTab] = useState("Overview");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const assessment = assessments.find((a) => a.id === currentId);

  useEffect(() => {
    if (!assessment) router.push("/");
  }, [assessment, router]);

  if (!assessment) return null;

  const { mappings, clarifications, isStale } = assessment;
  const total = mappings.length;
  const supported = mappings.filter((m) => m.status === "accepted").length;
  const needsReview = mappings.filter((m) =>
    ["pending", "weak", "ambiguous"].includes(m.status)
  ).length;
  const missing = mappings.filter((m) => m.status === "missing").length;
  const percent = total === 0 ? 0 : Math.round((supported / total) * 100);

  const missingList = mappings.filter((m) => m.status === "missing");
  const selected = mappings.find((m) => m.id === selectedId) || null;

  const updateMappingStatus = (
    id: string,
    status: Mapping["status"],
    notes?: string
  ) => {
    const updated = mappings.map((m) =>
      m.id === id ? { ...m, status, userNotes: notes ?? m.userNotes } : m
    );
    const newSupported = updated.filter((m) => m.status === "accepted").length;
    const newPercent = total === 0 ? 0 : Math.round((newSupported / total) * 100);
    updateAssessment(assessment.id, {
      mappings: updated,
      isStale: true,
      completeness: newPercent,
    });
  };

  return (
    <div className="flex min-h-screen app-shell">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Topbar breadcrumb={["Assessments", assessment.title]} />

        <main className="app-content flex-1 p-4 sm:p-6 lg:p-8 max-w-[1400px] w-full">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between flex-wrap gap-3 sm:gap-4 mb-6">
            <div className="min-w-0">
              <h1 className="text-xl sm:text-2xl font-bold text-ink">
                {assessment.title}
              </h1>
              <div className="flex items-center gap-2 text-xs text-ink-mute mt-1 font-mono flex-wrap">
                <span className="truncate">{assessment.guidelineName || "guideline.txt"}</span>
                <span>·</span>
                <span className="truncate">{assessment.applicationName || "application.txt"}</span>
                <span>·</span>
                <span>Updated {formatDate(assessment.updatedAt)}</span>
              </div>
            </div>
            <div className="flex gap-2 flex-wrap">
              <button onClick={() => router.push("/new")} className="btn-secondary">
                <RotateCcw size={16} /> Re-run
              </button>
              <button
                onClick={() => {
                  if (confirm("Delete this assessment?")) {
                    deleteAssessment(assessment.id);
                    router.push("/");
                  }
                }}
                className="btn-secondary"
                style={{ color: "var(--danger)" }}
              >
                <Trash2 size={16} /> Delete
              </button>
            </div>
          </div>

          <AnimatePresence>
            {isStale && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden mb-6"
              >
                <div
                  className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm"
                  style={{
                    background: "var(--warning-soft)",
                    color: "var(--warning)",
                  }}
                >
                  <AlertTriangle size={16} />
                  <span className="flex-1">
                    You've modified the review since the last analysis.
                  </span>
                  <button
                    onClick={() =>
                      updateAssessment(assessment.id, { isStale: false })
                    }
                    className="text-xs font-medium underline"
                  >
                    Dismiss
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="tabs-scroll mb-6 border-b" style={{ borderColor: "var(--border)" }}>
            <div className="flex gap-4 sm:gap-6 -mb-px min-w-max">
              {TABS.map((t) => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  className="pb-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap flex items-center gap-2"
                  style={{
                    borderColor: tab === t ? "var(--brand)" : "transparent",
                    color: tab === t ? "var(--brand)" : "var(--text-muted)",
                  }}
                >
                  {t}
                  {t === "Missing Documents" && missing > 0 && (
                    <span className="chip chip-danger">{missing}</span>
                  )}
                  {t === "Clarification Questions" && clarifications.length > 0 && (
                    <span className="chip chip-info">{clarifications.length}</span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {tab === "Overview" && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
              <div className="card lg:col-span-2">
                <h2 className="text-base font-semibold text-ink mb-6">
                  Completeness
                </h2>
                <div className="flex flex-col sm:flex-row items-center gap-6 sm:gap-8">
                  <Donut percent={percent} />
                  <div className="w-full sm:flex-1">
                    <p className="text-sm text-ink font-medium mb-4">
                      {supported} of {total} requirements complete
                    </p>
                    <ul className="space-y-3">
                      <Legend color="#10b981" label="Supported" value={supported} />
                      <Legend color="#f59e0b" label="Needs review" value={needsReview} />
                      <Legend color="#ef4444" label="Missing" value={missing} />
                    </ul>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 lg:grid-cols-1 gap-3 sm:gap-4">
                <StatBlock label="Supported" value={supported} color="emerald" />
                <StatBlock label="Needs review" value={needsReview} color="amber" />
                <StatBlock label="Missing" value={missing} color="red" />
                <StatBlock label="Total" value={total} color="slate" />
              </div>
            </div>
          )}

          {tab === "Requirements" && (
            <div className="card !p-0 overflow-hidden">
              {mappings.length === 0 ? (
                <p className="text-center py-12 text-ink-mute text-sm">
                  No mappings available.
                </p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full mobile-cards">
                    <thead>
                      <tr>
                        <th className="table-head w-24">ID</th>
                        <th className="table-head">Requirement</th>
                        <th className="table-head w-40">Evidence</th>
                        <th className="table-head w-28">Confidence</th>
                        <th className="table-head w-32">Review</th>
                      </tr>
                    </thead>
                    <tbody>
                      {mappings.map((m) => (
                        <tr
                          key={m.id}
                          onClick={() => setSelectedId(m.id)}
                          className="cursor-pointer"
                          onMouseEnter={(e) =>
                            (e.currentTarget.style.background = "var(--bg-hover)")
                          }
                          onMouseLeave={(e) =>
                            (e.currentTarget.style.background = "transparent")
                          }
                        >
                          <td className="table-cell font-mono text-xs text-ink-mute">
                            {m.requirementId}
                          </td>
                          <td className="table-cell">
                            <p className="text-sm text-ink line-clamp-2">
                              {m.requirementText}
                            </p>
                          </td>
                          <td className="table-cell" data-label="Evidence">
                            <EvidenceChip status={m.status} />
                          </td>
                          <td className="table-cell" data-label="Confidence">
                            <span className="text-sm font-medium">
                              {m.confidence}%
                            </span>
                          </td>
                          <td className="table-cell" data-label="Review">
                            <ReviewChip status={m.status} />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {tab === "Missing Documents" && (
            <div className="card">
              {missingList.length === 0 ? (
                <div className="text-center py-12">
                  <CheckCircle2
                    size={40}
                    className="mx-auto mb-3"
                    style={{ color: "var(--success)" }}
                  />
                  <p className="text-ink font-medium">No missing documents</p>
                  <p className="text-sm text-ink-mute">
                    Every requirement has supporting evidence.
                  </p>
                </div>
              ) : (
                <ul className="space-y-3">
                  {missingList.map((m) => (
                    <li
                      key={m.id}
                      onClick={() => setSelectedId(m.id)}
                      className="border rounded-lg p-4 flex items-start gap-3 cursor-pointer"
                      style={{ borderColor: "var(--border)" }}
                    >
                      <XCircle
                        size={18}
                        className="mt-0.5 shrink-0"
                        style={{ color: "var(--danger)" }}
                      />
                      <div>
                        <p className="text-sm font-medium text-ink">
                          {m.requirementText}
                        </p>
                        <p className="text-xs text-ink-mute mt-1">
                          Source: {m.sourceCitation}
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}

          {tab === "Clarification Questions" && (
            <div className="card">
              {clarifications.length === 0 ? (
                <p className="text-sm text-ink-mute text-center py-8">
                  No clarification questions generated.
                </p>
              ) : (
                <ol className="space-y-4">
                  {clarifications.map((q, i) => (
                    <li key={i} className="flex gap-3">
                      <span
                        className="text-xs font-mono font-semibold shrink-0 w-8 pt-0.5"
                        style={{ color: "var(--brand)" }}
                      >
                        Q{i + 1}
                      </span>
                      <p className="text-sm text-ink-soft leading-relaxed">{q}</p>
                    </li>
                  ))}
                </ol>
              )}
            </div>
          )}

          {tab === "Audit Trail" && (
            <div className="card">
              <ol className="space-y-4">
                <AuditRow
                  title="Analysis generated"
                  time={formatDate(assessment.updatedAt)}
                  description={`${mappings.length} requirements mapped`}
                />
                <AuditRow
                  title="Guideline uploaded"
                  time={formatDate(assessment.updatedAt)}
                  description={assessment.guidelineName || "guideline.txt"}
                />
                <AuditRow
                  title="Application uploaded"
                  time={formatDate(assessment.updatedAt)}
                  description={assessment.applicationName || "application.txt"}
                />
              </ol>
            </div>
          )}
        </main>
      </div>

      <AnimatePresence>
        {selected && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedId(null)}
              className="fixed inset-0 z-40"
              style={{ background: "rgba(0,0,0,0.4)" }}
            />
            <motion.aside
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="side-panel fixed right-0 top-0 h-screen w-full max-w-md z-50 overflow-y-auto"
              style={{
                background: "var(--bg-surface)",
                boxShadow: "var(--shadow-pop)",
              }}
            >
              <div
                className="sticky top-0 px-4 sm:px-6 py-4 flex items-center justify-between z-10 border-b"
                style={{
                  background: "var(--bg-surface)",
                  borderColor: "var(--border)",
                }}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className="font-mono text-sm text-ink-mute">
                    {selected.requirementId}
                  </span>
                  <span
                    className={cn(
                      "chip",
                      selected.status === "missing"
                        ? "chip-danger"
                        : selected.status === "weak"
                        ? "chip-warning"
                        : "chip-success"
                    )}
                  >
                    {selected.status}
                  </span>
                </div>
                <button
                  onClick={() => setSelectedId(null)}
                  className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                  style={{ color: "var(--text-muted)" }}
                >
                  <X size={18} />
                </button>
              </div>

              <div className="p-4 sm:p-6 space-y-6">
                <div>
                  <h3 className="text-base font-semibold text-ink mb-2">
                    {selected.requirementText}
                  </h3>
                  <p className="text-xs text-ink-mute">
                    Source: {selected.sourceCitation}
                  </p>
                </div>

                <div
                  className="border rounded-lg p-4"
                  style={{ borderColor: "var(--border)" }}
                >
                  <h4 className="text-xs uppercase tracking-wider font-semibold text-ink-mute mb-3">
                    AI Assessment
                  </h4>
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-xs text-ink-mute">Status</span>
                    <span className="chip chip-warning">{selected.status}</span>
                  </div>
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-xs text-ink-mute">Confidence</span>
                    <span className="text-sm font-semibold text-ink">
                      {selected.confidence}%
                    </span>
                  </div>
                  <p className="text-sm text-ink-soft leading-relaxed">
                    {selected.aiReasoning}
                  </p>
                </div>

                {selected.evidenceQuote && (
                  <div>
                    <h4 className="text-xs uppercase tracking-wider font-semibold text-ink-mute mb-3">
                      Application Evidence
                    </h4>
                    <blockquote
                      className="border-l-4 px-4 py-3 rounded-r-lg"
                      style={{
                        borderColor: "var(--brand)",
                        background: "var(--bg-surface-2)",
                      }}
                    >
                      <p className="text-sm text-ink italic">
                        "{selected.evidenceQuote}"
                      </p>
                    </blockquote>
                  </div>
                )}

                <div
                  className="pt-6 border-t"
                  style={{ borderColor: "var(--border)" }}
                >
                  <h4 className="text-xs uppercase tracking-wider font-semibold text-ink-mute mb-3">
                    Human Review
                  </h4>
                  <select
                    value={selected.status}
                    onChange={(e) =>
                      updateMappingStatus(
                        selected.id,
                        e.target.value as Mapping["status"]
                      )
                    }
                    className="input mb-3"
                  >
                    <option value="pending">Pending</option>
                    <option value="accepted">Confirmed</option>
                    <option value="rejected">Rejected</option>
                    <option value="missing">Missing</option>
                    <option value="weak">Weak</option>
                    <option value="ambiguous">Ambiguous</option>
                  </select>
                  <textarea
                    value={selected.userNotes || ""}
                    onChange={(e) =>
                      updateMappingStatus(
                        selected.id,
                        selected.status,
                        e.target.value
                      )
                    }
                    placeholder="Add reviewer note (optional)"
                    className="input h-24 resize-none"
                  />
                  <div className="grid grid-cols-3 gap-2 mt-3">
                    <button
                      onClick={() => updateMappingStatus(selected.id, "accepted")}
                      className="btn-success text-xs py-2"
                    >
                      Confirm
                    </button>
                    <button
                      onClick={() => updateMappingStatus(selected.id, "rejected")}
                      className="btn-danger text-xs py-2"
                    >
                      Reject
                    </button>
                    <button
                      onClick={() => updateMappingStatus(selected.id, "pending")}
                      className="btn-secondary text-xs py-2"
                    >
                      Reset
                    </button>
                  </div>
                </div>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </div>
  );
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
    <li className="flex items-center gap-3 text-sm">
      <span className="w-2.5 h-2.5 rounded-full" style={{ background: color }} />
      <span className="text-ink-soft">{label}</span>
      <span className="ml-auto font-semibold text-ink">{value}</span>
    </li>
  );
}

function StatBlock({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color: "emerald" | "amber" | "red" | "slate";
}) {
  const palette = {
    emerald: { bg: "var(--success-soft)", fg: "var(--success)" },
    amber: { bg: "var(--warning-soft)", fg: "var(--warning)" },
    red: { bg: "var(--danger-soft)", fg: "var(--danger)" },
    slate: { bg: "var(--bg-hover)", fg: "var(--text-soft)" },
  }[color];

  return (
    <div
      className="rounded-xl p-3 sm:p-4 flex items-center justify-between"
      style={{ background: palette.bg, color: palette.fg }}
    >
      <span className="text-xs sm:text-sm font-medium">{label}</span>
      <span className="text-lg sm:text-xl font-bold">{value}</span>
    </div>
  );
}

function EvidenceChip({ status }: { status: Mapping["status"] }) {
  if (status === "missing") return <span className="chip chip-danger">Missing</span>;
  if (status === "weak") return <span className="chip chip-warning">Weak</span>;
  if (status === "ambiguous") return <span className="chip chip-warning">Ambiguous</span>;
  if (status === "accepted") return <span className="chip chip-success">Supported</span>;
  if (status === "rejected") return <span className="chip chip-neutral">Rejected</span>;
  return <span className="chip chip-success">Supported</span>;
}

function ReviewChip({ status }: { status: Mapping["status"] }) {
  if (status === "accepted") return <span className="chip chip-success">Confirmed</span>;
  if (status === "rejected") return <span className="chip chip-danger">Rejected</span>;
  return <span className="chip chip-warning">Pending</span>;
}

function AuditRow({
  title,
  time,
  description,
}: {
  title: string;
  time: string;
  description: string;
}) {
  return (
    <li className="flex gap-4">
      <div
        className="w-2 h-2 rounded-full mt-2 shrink-0"
        style={{ background: "var(--brand)" }}
      />
      <div>
        <div className="flex items-center gap-3 flex-wrap">
          <p className="text-sm font-medium text-ink">{title}</p>
          <span className="text-xs text-ink-mute">{time}</span>
        </div>
        <p className="text-xs text-ink-mute mt-0.5">{description}</p>
      </div>
    </li>
  );
}