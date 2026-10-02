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
  const { assessments, currentId, updateAssessment, deleteAssessment } = useStore();
  const [tab, setTab] = useState("Overview");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const assessment = assessments.find((a) => a.id === currentId);

  useEffect(() => {
    if (!assessment) {
      router.push("/");
    }
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

  const updateMappingStatus = (id: string, status: Mapping["status"], notes?: string) => {
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

  const rerun = () => {
    router.push("/new");
  };

  const remove = () => {
    if (confirm("Delete this assessment?")) {
      deleteAssessment(assessment.id);
      router.push("/");
    }
  };

  return (
    <div className="flex min-h-screen bg-canvas">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Topbar breadcrumb={["Assessments", assessment.title]} />

        <main className="flex-1 p-6 lg:p-8 max-w-[1400px] w-full">
          <div className="flex items-start justify-between flex-wrap gap-4 mb-6">
            <div className="min-w-0">
              <h1 className="text-2xl font-bold text-ink">{assessment.title}</h1>
              <div className="flex items-center gap-2 text-xs text-ink-mute mt-1 font-mono flex-wrap">
                <span>{assessment.guidelineName || "guideline.txt"}</span>
                <span>·</span>
                <span>{assessment.applicationName || "application.txt"}</span>
                <span>·</span>
                <span>Updated {formatDate(assessment.updatedAt)}</span>
              </div>
            </div>
            <div className="flex gap-2">
              <button onClick={rerun} className="btn-secondary">
                <RotateCcw size={16} /> Re-run
              </button>
              <button onClick={remove} className="btn-secondary text-red-600 hover:bg-red-50">
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
                <div className="flex items-center gap-3 bg-amber-50 border border-amber-200 text-amber-800 px-4 py-3 rounded-lg text-sm">
                  <AlertTriangle size={16} />
                  <span>You've modified the review since the last analysis.</span>
                  <button
                    onClick={() => updateAssessment(assessment.id, { isStale: false })}
                    className="ml-auto text-xs font-medium underline"
                  >
                    Dismiss
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="border-b border-line mb-6 overflow-x-auto">
            <div className="flex gap-6 -mb-px min-w-max">
              {TABS.map((t) => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  className={cn(
                    "pb-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap flex items-center gap-2",
                    tab === t
                      ? "border-brand-600 text-brand-600"
                      : "border-transparent text-ink-mute hover:text-ink"
                  )}
                >
                  {t}
                  {t === "Missing Documents" && missing > 0 && (
                    <span className="chip-danger">{missing}</span>
                  )}
                  {t === "Clarification Questions" && clarifications.length > 0 && (
                    <span className="chip-info">{clarifications.length}</span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {tab === "Overview" && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="card p-6 lg:col-span-2">
                <h2 className="text-base font-semibold text-ink mb-6">Completeness</h2>
                <div className="flex items-center gap-8 flex-wrap">
                  <Donut percent={percent} />
                  <div className="flex-1 min-w-[200px]">
                    <p className="text-sm text-ink font-medium mb-4">
                      {supported} of {total} requirements complete
                    </p>
                    <ul className="space-y-3">
                      <Legend color="bg-emerald-500" label="Supported" value={supported} />
                      <Legend color="bg-amber-500" label="Needs review" value={needsReview} />
                      <Legend color="bg-red-500" label="Missing" value={missing} />
                    </ul>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <StatBlock label="Supported" value={supported} color="emerald" />
                <StatBlock label="Needs review" value={needsReview} color="amber" />
                <StatBlock label="Missing" value={missing} color="red" />
                <StatBlock label="Total" value={total} color="slate" />
              </div>
            </div>
          )}

          {tab === "Requirements" && (
            <div className="card overflow-hidden">
              {mappings.length === 0 ? (
                <p className="text-center py-12 text-ink-mute text-sm">No mappings available.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
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
                          className="hover:bg-slate-50 cursor-pointer transition-colors"
                        >
                          <td className="table-cell font-mono text-xs text-ink-mute">
                            {m.requirementId}
                          </td>
                          <td className="table-cell max-w-md">
                            <p className="text-sm text-ink line-clamp-2">{m.requirementText}</p>
                          </td>
                          <td className="table-cell">
                            <EvidenceChip status={m.status} />
                          </td>
                          <td className="table-cell">
                            <span className="text-sm font-medium">{m.confidence}%</span>
                          </td>
                          <td className="table-cell">
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
            <div className="card p-6">
              {missingList.length === 0 ? (
                <div className="text-center py-12">
                  <CheckCircle2 size={40} className="text-emerald-500 mx-auto mb-3" />
                  <p className="text-ink font-medium">No missing documents</p>
                  <p className="text-sm text-ink-mute">Every requirement has supporting evidence.</p>
                </div>
              ) : (
                <ul className="space-y-3">
                  {missingList.map((m) => (
                    <li
                      key={m.id}
                      onClick={() => setSelectedId(m.id)}
                      className="border border-line rounded-lg p-4 flex items-start gap-3 hover:bg-slate-50 cursor-pointer"
                    >
                      <XCircle size={18} className="text-red-500 mt-0.5 shrink-0" />
                      <div>
                        <p className="text-sm font-medium text-ink">{m.requirementText}</p>
                        <p className="text-xs text-ink-mute mt-1">Source: {m.sourceCitation}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}

          {tab === "Clarification Questions" && (
            <div className="card p-6">
              {clarifications.length === 0 ? (
                <p className="text-sm text-ink-mute text-center py-8">
                  No clarification questions generated.
                </p>
              ) : (
                <ol className="space-y-4">
                  {clarifications.map((q, i) => (
                    <li key={i} className="flex gap-3">
                      <span className="text-xs font-mono text-brand-600 font-semibold shrink-0 w-8 pt-0.5">
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
            <div className="card p-6">
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
              className="fixed inset-0 bg-ink/30 z-40"
            />
            <motion.aside
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="fixed right-0 top-0 h-screen w-full max-w-md bg-white shadow-pop z-50 overflow-y-auto"
            >
              <div className="sticky top-0 bg-white border-b border-line px-6 py-4 flex items-center justify-between z-10">
                <div className="flex items-center gap-3">
                  <span className="font-mono text-sm text-ink-mute">{selected.requirementId}</span>
                  <span
                    className={cn(
                      "chip",
                      selected.status === "missing" ? "chip-danger"
                      : selected.status === "weak" ? "chip-warning"
                      : "chip-success"
                    )}
                  >
                    {selected.status}
                  </span>
                </div>
                <button
                  onClick={() => setSelectedId(null)}
                  className="w-8 h-8 rounded-lg hover:bg-slate-100 flex items-center justify-center text-ink-mute"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="p-6 space-y-6">
                <div>
                  <h3 className="text-base font-semibold text-ink mb-2">
                    {selected.requirementText}
                  </h3>
                  <p className="text-xs text-ink-mute">Source: {selected.sourceCitation}</p>
                </div>

                <div className="border border-line rounded-lg p-4">
                  <h4 className="text-xs uppercase tracking-wider font-semibold text-ink-mute mb-3">
                    AI Assessment
                  </h4>
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-xs text-ink-mute">Status</span>
                    <span className="chip-warning">{selected.status}</span>
                  </div>
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-xs text-ink-mute">Confidence</span>
                    <span className="text-sm font-semibold text-ink">{selected.confidence}%</span>
                  </div>
                  <p className="text-sm text-ink-soft leading-relaxed">{selected.aiReasoning}</p>
                </div>

                {selected.evidenceQuote && (
                  <div>
                    <h4 className="text-xs uppercase tracking-wider font-semibold text-ink-mute mb-3">
                      Application Evidence
                    </h4>
                    <blockquote className="border-l-4 border-brand-500 bg-slate-50 px-4 py-3 rounded-r-lg">
                      <p className="text-sm text-ink italic">"{selected.evidenceQuote}"</p>
                    </blockquote>
                  </div>
                )}

                <div className="border-t border-line pt-6">
                  <h4 className="text-xs uppercase tracking-wider font-semibold text-ink-mute mb-3">
                    Human Review
                  </h4>
                  <select
                    value={selected.status}
                    onChange={(e) =>
                      updateMappingStatus(selected.id, e.target.value as Mapping["status"])
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
                      updateMappingStatus(selected.id, selected.status, e.target.value)
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

function Legend({ color, label, value }: { color: string; label: string; value: number }) {
  return (
    <li className="flex items-center gap-3 text-sm">
      <span className={cn("w-2.5 h-2.5 rounded-full", color)} />
      <span className="text-ink-soft">{label}</span>
      <span className="ml-auto font-semibold text-ink">{value}</span>
    </li>
  );
}

function StatBlock({
  label, value, color,
}: {
  label: string;
  value: number;
  color: "emerald" | "amber" | "red" | "slate";
}) {
  const palette = {
    emerald: "bg-emerald-50 text-emerald-700",
    amber: "bg-amber-50 text-amber-700",
    red: "bg-red-50 text-red-700",
    slate: "bg-slate-50 text-slate-700",
  }[color];

  return (
    <div className={cn("rounded-xl p-4 flex items-center justify-between", palette)}>
      <span className="text-sm font-medium">{label}</span>
      <span className="text-xl font-bold">{value}</span>
    </div>
  );
}

function EvidenceChip({ status }: { status: Mapping["status"] }) {
  if (status === "missing") return <span className="chip-danger">Missing</span>;
  if (status === "weak") return <span className="chip-warning">Weak</span>;
  if (status === "ambiguous") return <span className="chip-warning">Ambiguous</span>;
  if (status === "accepted") return <span className="chip-success">Supported</span>;
  if (status === "rejected") return <span className="chip-neutral">Rejected</span>;
  return <span className="chip-success">Supported</span>;
}

function ReviewChip({ status }: { status: Mapping["status"] }) {
  if (status === "accepted") return <span className="chip-success">Confirmed</span>;
  if (status === "rejected") return <span className="chip-danger">Rejected</span>;
  return <span className="chip-warning">Pending</span>;
}

function AuditRow({
  title, time, description,
}: {
  title: string;
  time: string;
  description: string;
}) {
  return (
    <li className="flex gap-4">
      <div className="w-2 h-2 rounded-full bg-brand-500 mt-2 shrink-0" />
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