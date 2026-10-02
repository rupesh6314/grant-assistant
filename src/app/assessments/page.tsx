"use client";

import { useRouter } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import Topbar from "@/components/Topbar";
import { useStore } from "@/store/useStore";
import { cn, formatDate } from "@/lib/utils";
import { Plus, FileText, Trash2 } from "lucide-react";

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

export default function AssessmentsPage() {
  const router = useRouter();
  const assessments = useStore((s) => s.assessments);
  const setCurrent = useStore((s) => s.setCurrent);
  const deleteAssessment = useStore((s) => s.deleteAssessment);

  return (
    <div className="flex min-h-screen app-shell">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Topbar breadcrumb={["Assessments"]} />
        <main className="flex-1 p-6 lg:p-8 max-w-[1400px] w-full">
          <div className="flex items-start justify-between mb-8 flex-wrap gap-4">
            <div>
              <h1 className="text-2xl font-bold text-ink">All Assessments</h1>
              <p className="text-sm text-ink-mute mt-1">
                {assessments.length} assessment
                {assessments.length === 1 ? "" : "s"}
              </p>
            </div>
            <button
              onClick={() => router.push("/new")}
              style={primaryButtonStyle}
              onMouseEnter={hoverOn}
              onMouseLeave={hoverOff}
            >
              <Plus size={16} /> New Assessment
            </button>
          </div>

          {assessments.length === 0 ? (
            <div className="card !p-12 text-center">
              <FileText
                size={40}
                className="mx-auto mb-3"
                style={{ color: "var(--text-muted)" }}
              />
              <p className="text-ink font-medium mb-2">No assessments yet</p>
              <button
                onClick={() => router.push("/new")}
                style={{ ...primaryButtonStyle, marginTop: "0.75rem" }}
                onMouseEnter={hoverOn}
                onMouseLeave={hoverOff}
              >
                <Plus size={16} /> Create One
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {assessments.map((a) => (
                <div
                  key={a.id}
                  className="card hover:shadow-pop transition-shadow group"
                >
                  <div
                    onClick={() => {
                      setCurrent(a.id);
                      router.push("/results");
                    }}
                    className="cursor-pointer"
                  >
                    <div className="flex items-start justify-between mb-3">
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
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (confirm("Delete this assessment?"))
                            deleteAssessment(a.id);
                        }}
                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                        style={{ color: "var(--text-muted)" }}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                    <h3 className="font-semibold text-ink mb-1 line-clamp-2">
                      {a.title}
                    </h3>
                    <p className="text-xs text-ink-mute mb-4">
                      {formatDate(a.updatedAt)}
                    </p>
                    <div className="flex items-center gap-2">
                      <div
                        className="flex-1 h-1.5 rounded-full overflow-hidden"
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
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}