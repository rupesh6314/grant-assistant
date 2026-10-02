"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Sidebar from "@/components/Sidebar";
import Topbar from "@/components/Topbar";
import UploadDropzone from "@/components/UploadDropzone";
import Wizard from "@/components/Wizard";
import { useStore } from "@/store/useStore";
import { uid } from "@/lib/utils";
import { ArrowLeft, ArrowRight, Loader2, Check } from "lucide-react";

export default function NewAssessment() {
  const router = useRouter();
  const addAssessment = useStore((s) => s.addAssessment);
  const setCurrent = useStore((s) => s.setCurrent);
  const addDocument = useStore((s) => s.addDocument);

  const [step, setStep] = useState(1);
  const [title, setTitle] = useState("");
  const [guidelineText, setGuidelineText] = useState("");
  const [guidelineName, setGuidelineName] = useState("");
  const [applicationText, setApplicationText] = useState("");
  const [applicationName, setApplicationName] = useState("");
  const [supportingText, setSupportingText] = useState("");
  const [supportingName, setSupportingName] = useState("");
  const [analyzing, setAnalyzing] = useState(false);
  const [analyzeError, setAnalyzeError] = useState<string | null>(null);

  useEffect(() => {
    const raw = sessionStorage.getItem("template-prefill");
    if (!raw) return;
    try {
      const pre = JSON.parse(raw);
      if (pre.title) setTitle(pre.title);
      if (pre.guidelineText) setGuidelineText(pre.guidelineText);
      if (pre.guidelineName) setGuidelineName(pre.guidelineName);
      sessionStorage.removeItem("template-prefill");
    } catch {}
  }, []);

  const canNext =
    (step === 1 && guidelineText && title.trim()) ||
    (step === 2 && applicationText) ||
    step === 3;

  const runAnalysis = async () => {
    setAnalyzeError(null);
    setAnalyzing(true);

    const payload = {
      guideline: guidelineText,
      application:
        applicationText +
        (supportingText ? `\n\n--- SUPPORTING ---\n${supportingText}` : ""),
    };

    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Analysis failed");

      const mappings = data.mappings || [];
      const total = mappings.length;
      const accepted = mappings.filter((m: any) => m.status === "accepted").length;
      const completeness = total === 0 ? 0 : Math.round((accepted / total) * 100);

      const now = new Date().toISOString();
      const newId = uid("asmt");

      addAssessment({
        id: newId,
        title: title.trim(),
        status: "in-review",
        completeness,
        updatedAt: now,
        createdAt: now,
        guidelineName,
        applicationName,
        mappings,
        clarifications: data.clarificationQuestions || [],
        isStale: false,
      });

      setCurrent(newId);
      router.push("/results");
    } catch (e: any) {
      setAnalyzeError(e.message);
      setAnalyzing(false);
    }
  };

  return (
    <div className="flex min-h-screen app-shell">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Topbar breadcrumb={["Assessments", "New Assessment"]} />

        <main className="app-content flex-1 p-4 sm:p-6 lg:p-8 max-w-[1100px] w-full">
          <button
            onClick={() => router.push("/")}
            className="btn-ghost mb-4 -ml-2"
          >
            <ArrowLeft size={16} /> Back
          </button>

          <h1 className="text-2xl font-bold text-ink mb-2">
            Create New Assessment
          </h1>
          <p className="text-sm text-ink-mute mb-6 sm:mb-8">
            Upload the grant guideline, application, and supporting documents.
          </p>

          <div className="card mb-4 sm:mb-6 !p-4 sm:!p-6">
            <Wizard step={step} onStepClick={(n) => setStep(n)} />
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
            >
              {step === 1 && (
                <div className="card space-y-5">
                  <div>
                    <label className="block text-sm font-medium text-ink mb-2">
                      Assessment Title <span style={{ color: "var(--danger)" }}>*</span>
                    </label>
                    <input
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="e.g. Community Digital Innovation Grant"
                      className="input"
                    />
                  </div>

                  <div>
                    <h2 className="text-base font-semibold text-ink mb-3">
                      Grant Guideline <span style={{ color: "var(--danger)" }}>*</span>
                    </h2>
                    <UploadDropzone
                      label="Drop your guideline document here"
                      help="TXT, MD (Max 10MB)"
                      required
                      onFile={(text, name) => {
                        setGuidelineText(text);
                        setGuidelineName(name);
                        addDocument({
                          id: uid("doc"),
                          name,
                          type: "guideline",
                          size: text.length,
                          uploadedAt: new Date().toISOString(),
                          content: text,
                          tags: [],
                        });
                      }}
                      fileName={guidelineName}
                      onClear={() => {
                        setGuidelineText("");
                        setGuidelineName("");
                      }}
                    />
                    <details className="mt-3 text-sm">
                      <summary className="cursor-pointer text-ink-mute">
                        Or paste text manually
                      </summary>
                      <textarea
                        value={guidelineText}
                        onChange={(e) => {
                          setGuidelineText(e.target.value);
                          if (!guidelineName)
                            setGuidelineName("pasted-guideline.txt");
                        }}
                        placeholder="Paste guideline text here…"
                        className="input mt-3 h-40 resize-none"
                      />
                    </details>
                  </div>
                </div>
              )}

              {step === 2 && (
                <div className="card">
                  <h2 className="text-base font-semibold text-ink mb-3">
                    Draft Application <span style={{ color: "var(--danger)" }}>*</span>
                  </h2>
                  <UploadDropzone
                    label="Drop application document here"
                    help="TXT, MD (Max 10MB)"
                    required
                    onFile={(text, name) => {
                      setApplicationText(text);
                      setApplicationName(name);
                      addDocument({
                        id: uid("doc"),
                        name,
                        type: "application",
                        size: text.length,
                        uploadedAt: new Date().toISOString(),
                        content: text,
                        tags: [],
                      });
                    }}
                    fileName={applicationName}
                    onClear={() => {
                      setApplicationText("");
                      setApplicationName("");
                    }}
                  />
                  <details className="mt-3 text-sm">
                    <summary className="cursor-pointer text-ink-mute">
                      Or paste text manually
                    </summary>
                    <textarea
                      value={applicationText}
                      onChange={(e) => {
                        setApplicationText(e.target.value);
                        if (!applicationName)
                          setApplicationName("pasted-application.txt");
                      }}
                      placeholder="Paste application text here…"
                      className="input mt-3 h-40 resize-none"
                    />
                  </details>
                </div>
              )}

              {step === 3 && (
                <div className="card">
                  <h2 className="text-base font-semibold text-ink mb-3">
                    Supporting Documents{" "}
                    <span className="text-ink-mute font-normal">(optional)</span>
                  </h2>
                  <UploadDropzone
                    label="Drop supporting documents here"
                    help="TXT, MD (Max 10MB)"
                    onFile={(text, name) => {
                      setSupportingText(text);
                      setSupportingName(name);
                      addDocument({
                        id: uid("doc"),
                        name,
                        type: "supporting",
                        size: text.length,
                        uploadedAt: new Date().toISOString(),
                        content: text,
                        tags: [],
                      });
                    }}
                    fileName={supportingName}
                    onClear={() => {
                      setSupportingText("");
                      setSupportingName("");
                    }}
                  />
                </div>
              )}

              {step === 4 && (
                <div className="card">
                  <h2 className="text-base font-semibold text-ink mb-4">
                    Review & Run
                  </h2>
                  <ul className="space-y-3 mb-6">
                    <SummaryRow label="Title" value={title || "—"} />
                    <SummaryRow label="Guideline" value={guidelineName || "—"} />
                    <SummaryRow label="Application" value={applicationName || "—"} />
                    <SummaryRow label="Supporting" value={supportingName || "None"} />
                  </ul>

                  {analyzeError && (
                    <div
                      className="mb-4 p-3 rounded-lg text-sm"
                      style={{
                        background: "var(--danger-soft)",
                        color: "var(--danger)",
                      }}
                    >
                      {analyzeError}
                    </div>
                  )}

                  <button
                    onClick={runAnalysis}
                    disabled={analyzing}
                    className="btn-primary w-full py-3"
                  >
                    {analyzing ? (
                      <>
                        <Loader2 size={16} className="animate-spin" /> Analyzing…
                      </>
                    ) : (
                      <>
                        Run Assessment <ArrowRight size={16} />
                      </>
                    )}
                  </button>
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          {step < 4 && (
            <div className="flex justify-between gap-3 mt-6">
              <button
                onClick={() => setStep(step - 1)}
                disabled={step === 1}
                className="btn-secondary flex-1 sm:flex-initial"
              >
                <ArrowLeft size={16} /> Back
              </button>
              <button
                onClick={() => setStep(step + 1)}
                disabled={!canNext}
                className="btn-primary flex-1 sm:flex-initial"
              >
                Next <ArrowRight size={16} />
              </button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <li
      className="flex items-center justify-between text-sm py-2 border-b last:border-0"
      style={{ borderColor: "var(--border)" }}
    >
      <span className="text-ink-mute">{label}</span>
      <span className="text-ink font-medium flex items-center gap-2 truncate">
        <Check size={14} style={{ color: "var(--success)" }} />
        {value}
      </span>
    </li>
  );
}