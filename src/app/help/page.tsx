"use client";

import { useState } from "react";
import Sidebar from "@/components/Sidebar";
import Topbar from "@/components/Topbar";
import {
  BookOpen,
  MessageCircle,
  Keyboard,
  Lightbulb,
  ChevronDown,
  Mail,
  ExternalLink,
  Rocket,
  UploadCloud,
  FileText,
  Sparkles,
} from "lucide-react";

const FAQS = [
  {
    q: "What does this tool actually do?",
    a: "It reads your grant guideline and draft application, extracts every requirement, maps each one to the corresponding part of your application, and tells you which requirements are missing, weak, or unclear.",
  },
  {
    q: "Does it make funding decisions?",
    a: "No. This is strictly a completeness checker. Always verify with the funding organization.",
  },
  {
    q: "Where is my data stored?",
    a: "All assessments, documents, and templates are stored in your browser's localStorage. Nothing is stored on our servers.",
  },
  {
    q: "What file types can I upload?",
    a: "TXT and MD files up to 10MB. For PDFs and Word documents, copy the text and paste it directly into the text area.",
  },
  {
    q: "Why does the assessment become 'stale'?",
    a: "If you edit the guideline or application after running an assessment, the previous results may no longer reflect the current documents.",
  },
  {
    q: "Can I edit the AI's findings?",
    a: "Yes. Click any requirement row to open the detail panel. You can Confirm, Reject, or Reset each mapping.",
  },
];

const SHORTCUTS = [
  { keys: ["Ctrl", "K"], action: "Open command palette" },
  { keys: ["Ctrl", "N"], action: "New assessment" },
  { keys: ["Ctrl", "/"], action: "Open help" },
  { keys: ["Esc"], action: "Close side panel or modal" },
];

const STEPS = [
  {
    icon: UploadCloud,
    title: "1. Upload your documents",
    body: "Go to New Assessment. Upload the grant guideline, the draft application, and any supporting documents.",
  },
  {
    icon: Sparkles,
    title: "2. Run the audit",
    body: "Click Run Assessment. The AI extracts requirements and maps them to your application.",
  },
  {
    icon: FileText,
    title: "3. Review the results",
    body: "Open each requirement row to see the AI's reasoning, evidence, and confidence score.",
  },
  {
    icon: Rocket,
    title: "4. Track completion",
    body: "Watch the completeness donut update as you review. Check Reports to spot patterns.",
  },
];

export default function HelpPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  return (
    <div className="flex min-h-screen app-shell">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Topbar breadcrumb={["Help"]} />

        <main className="app-content flex-1 p-4 sm:p-6 lg:p-8 max-w-[1200px] w-full">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-ink">Help & Documentation</h1>
            <p className="text-sm text-ink-mute mt-1">
              Everything you need to get the most out of the assistant.
            </p>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-8 sm:mb-10">
            <QuickCard icon={BookOpen} label="Get Started" href="#getting-started" />
            <QuickCard icon={Lightbulb} label="FAQ" href="#faq" />
            <QuickCard icon={Keyboard} label="Shortcuts" href="#shortcuts" />
            <QuickCard icon={MessageCircle} label="Contact" href="#contact" />
          </div>

          <section id="getting-started" className="mb-10 sm:mb-12">
            <h2 className="text-lg font-semibold text-ink mb-4 sm:mb-6">
              Getting Started
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
              {STEPS.map((s, i) => {
                const Icon = s.icon;
                return (
                  <div key={i} className="card">
                    <div className="flex items-start gap-3">
                      <div
                        className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
                        style={{
                          background: "var(--brand-soft)",
                          color: "var(--brand)",
                        }}
                      >
                        <Icon size={18} />
                      </div>
                      <div>
                        <h3 className="text-sm font-semibold text-ink mb-1">
                          {s.title}
                        </h3>
                        <p className="text-sm text-ink-soft leading-relaxed">
                          {s.body}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          <section id="faq" className="mb-10 sm:mb-12">
            <h2 className="text-lg font-semibold text-ink mb-4 sm:mb-6">
              Frequently Asked Questions
            </h2>
            <div className="card !p-0 overflow-hidden divide-y" style={{ borderColor: "var(--border)" }}>
              {FAQS.map((f, i) => (
                <div key={i} style={{ borderColor: "var(--border)" }}>
                  <button
                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                    className="w-full flex items-center justify-between gap-4 px-4 sm:px-5 py-4 text-left"
                  >
                    <span className="text-sm font-medium text-ink">{f.q}</span>
                    <ChevronDown
                      size={18}
                      className="shrink-0 transition-transform"
                      style={{
                        color: "var(--text-muted)",
                        transform: openFaq === i ? "rotate(180deg)" : "rotate(0)",
                      }}
                    />
                  </button>
                  {openFaq === i && (
                    <div className="px-4 sm:px-5 pb-4 -mt-1 text-sm text-ink-soft leading-relaxed">
                      {f.a}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>

          <section id="shortcuts" className="mb-10 sm:mb-12">
            <h2 className="text-lg font-semibold text-ink mb-4 sm:mb-6">
              Keyboard Shortcuts
            </h2>
            <div className="card !p-0 overflow-hidden divide-y" style={{ borderColor: "var(--border)" }}>
              {SHORTCUTS.map((s, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between px-4 sm:px-5 py-3 text-sm gap-3"
                  style={{ borderColor: "var(--border)" }}
                >
                  <span className="text-ink-soft">{s.action}</span>
                  <div className="flex items-center gap-1 shrink-0">
                    {s.keys.map((k, j) => (
                      <span key={j} className="flex items-center gap-1">
                        <kbd
                          className="px-2 py-1 text-xs font-mono border rounded"
                          style={{
                            background: "var(--bg-surface-2)",
                            borderColor: "var(--border)",
                          }}
                        >
                          {k}
                        </kbd>
                        {j < s.keys.length - 1 && (
                          <span className="text-ink-mute text-xs">+</span>
                        )}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section id="contact">
            <h2 className="text-lg font-semibold text-ink mb-4 sm:mb-6">
              Contact & Support
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
              <a href="mailto:support@example.com" className="card">
                <div className="flex items-center gap-3 mb-2">
                  <Mail size={18} style={{ color: "var(--brand)" }} />
                  <span className="text-sm font-medium text-ink">
                    Email Support
                  </span>
                </div>
                <p className="text-sm text-ink-mute">support@example.com</p>
                <p className="text-xs text-ink-mute mt-2">
                  Typically responds within 24 hours
                </p>
              </a>
              <a
                href="https://console.groq.com/docs"
                target="_blank"
                rel="noreferrer"
                className="card"
              >
                <div className="flex items-center gap-3 mb-2">
                  <ExternalLink size={18} style={{ color: "var(--brand)" }} />
                  <span className="text-sm font-medium text-ink">Groq Docs</span>
                </div>
                <p className="text-sm text-ink-mute">
                  Model documentation and API reference
                </p>
                <p className="text-xs text-ink-mute mt-2">
                  console.groq.com/docs
                </p>
              </a>
            </div>
          </section>

          <div
            className="mt-10 sm:mt-12 card"
            style={{
              background: "var(--warning-soft)",
              borderColor: "var(--warning)",
            }}
          >
            <p className="text-sm leading-relaxed" style={{ color: "var(--warning)" }}>
              <strong>Disclaimer:</strong> This tool assists with completeness
              review but does not provide legal advice and does not determine
              funding eligibility.
            </p>
          </div>
        </main>
      </div>
    </div>
  );
}

function QuickCard({
  icon: Icon,
  label,
  href,
}: {
  icon: any;
  label: string;
  href: string;
}) {
  return (
    <a
      href={href}
      className="card flex flex-col sm:flex-row items-center gap-2 sm:gap-3 text-center sm:text-left"
    >
      <div
        className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
        style={{
          background: "var(--brand-soft)",
          color: "var(--brand)",
        }}
      >
        <Icon size={16} />
      </div>
      <span className="text-xs sm:text-sm font-medium text-ink">{label}</span>
    </a>
  );
}