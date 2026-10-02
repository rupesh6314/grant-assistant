"use client";

import { useState } from "react";
import Sidebar from "@/components/Sidebar";
import Topbar from "@/components/Topbar";
import {
  BookOpen, MessageCircle, Keyboard, Lightbulb, ChevronDown,
  Mail, ExternalLink, Rocket, UploadCloud, FileText, Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";

const FAQS = [
  {
    q: "What does this tool actually do?",
    a: "It reads your grant guideline and draft application, extracts every requirement, maps each one to the corresponding part of your application, and tells you which requirements are missing, weak, or unclear. It also generates clarification questions you should answer before submitting.",
  },
  {
    q: "Does it make funding decisions?",
    a: "No. This is strictly a completeness checker. It never decides whether you qualify for funding, and it is not a substitute for legal or compliance review. Always verify with the funding organization.",
  },
  {
    q: "Where is my data stored?",
    a: "All assessments, documents, and templates are stored in your browser's localStorage. Your documents are sent to Groq (the AI provider) only when you run an assessment. Nothing is stored on our servers.",
  },
  {
    q: "What file types can I upload?",
    a: "TXT and MD (Markdown) files up to 10MB. For PDFs and Word documents, copy the text and paste it directly into the text area.",
  },
  {
    q: "Why does the assessment become 'stale'?",
    a: "If you edit the guideline or application after running an assessment, the previous results may no longer reflect the current documents. A stale banner appears so you know to re-run the audit.",
  },
  {
    q: "Can I edit the AI's findings?",
    a: "Yes. Click any requirement row to open the detail panel. You can Confirm, Reject, or Reset each mapping. Your decisions override the AI's suggestions, and you can add reviewer notes.",
  },
  {
    q: "How many assessments can I run?",
    a: "There is no limit inside the app, but the free Groq API has rate limits (roughly 30 requests per minute). If you hit the limit, wait a few seconds and try again.",
  },
];

const SHORTCUTS = [
  { keys: ["Ctrl", "K"], action: "Open command palette (coming soon)" },
  { keys: ["Ctrl", "N"], action: "New assessment" },
  { keys: ["Ctrl", "/"], action: "Open help" },
  { keys: ["Esc"], action: "Close side panel or modal" },
];

const STEPS = [
  {
    icon: UploadCloud,
    title: "1. Upload your documents",
    body: "Go to New Assessment. Upload the grant guideline, the draft application, and any supporting documents. Or paste the text directly.",
  },
  {
    icon: Sparkles,
    title: "2. Run the audit",
    body: "Click Run Assessment. The AI extracts requirements, maps them to your application, and cites sources for each finding.",
  },
  {
    icon: FileText,
    title: "3. Review the results",
    body: "Open each requirement row to see the AI's reasoning, the evidence it found, and a confidence score. Confirm, Reject, or add notes.",
  },
  {
    icon: Rocket,
    title: "4. Track completion",
    body: "Watch the completeness donut update as you review. Check the Reports page to spot patterns across assessments.",
  },
];

export default function HelpPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  return (
    <div className="flex min-h-screen bg-canvas">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Topbar breadcrumb={["Help"]} />

        <main className="flex-1 p-6 lg:p-8 max-w-[1200px] w-full">
          <div className="mb-10">
            <h1 className="text-2xl font-bold text-ink">Help & Documentation</h1>
            <p className="text-sm text-ink-mute mt-1">
              Everything you need to get the most out of the Grant Completeness Assistant.
            </p>
          </div>

          {/* Quick links */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
            <QuickCard icon={BookOpen} label="Getting Started" href="#getting-started" />
            <QuickCard icon={Lightbulb} label="FAQ" href="#faq" />
            <QuickCard icon={Keyboard} label="Shortcuts" href="#shortcuts" />
            <QuickCard icon={MessageCircle} label="Contact" href="#contact" />
          </div>

          {/* Getting started */}
          <section id="getting-started" className="mb-12">
            <h2 className="text-lg font-semibold text-ink mb-6">Getting Started</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {STEPS.map((s, i) => {
                const Icon = s.icon;
                return (
                  <div key={i} className="card p-5">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-lg bg-brand-50 text-brand-600 flex items-center justify-center shrink-0">
                        <Icon size={18} />
                      </div>
                      <div>
                        <h3 className="text-sm font-semibold text-ink mb-1">{s.title}</h3>
                        <p className="text-sm text-ink-soft leading-relaxed">{s.body}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* FAQ */}
          <section id="faq" className="mb-12">
            <h2 className="text-lg font-semibold text-ink mb-6">
              Frequently Asked Questions
            </h2>
            <div className="card divide-y divide-line">
              {FAQS.map((f, i) => (
                <div key={i}>
                  <button
                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                    className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left hover:bg-slate-50 transition-colors"
                  >
                    <span className="text-sm font-medium text-ink">{f.q}</span>
                    <ChevronDown
                      size={18}
                      className={cn(
                        "text-ink-mute transition-transform shrink-0",
                        openFaq === i && "rotate-180"
                      )}
                    />
                  </button>
                  {openFaq === i && (
                    <div className="px-5 pb-4 -mt-1 text-sm text-ink-soft leading-relaxed">
                      {f.a}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>

          {/* Keyboard shortcuts */}
          <section id="shortcuts" className="mb-12">
            <h2 className="text-lg font-semibold text-ink mb-6">Keyboard Shortcuts</h2>
            <div className="card divide-y divide-line">
              {SHORTCUTS.map((s, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between px-5 py-3 text-sm"
                >
                  <span className="text-ink-soft">{s.action}</span>
                  <div className="flex items-center gap-1">
                    {s.keys.map((k, j) => (
                      <span key={j} className="flex items-center gap-1">
                        <kbd className="px-2 py-1 text-xs font-mono bg-slate-100 border border-line rounded">
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

          {/* Contact */}
          <section id="contact">
            <h2 className="text-lg font-semibold text-ink mb-6">Contact & Support</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <a
                href="mailto:support@example.com"
                className="card p-5 hover:shadow-pop transition-shadow"
              >
                <div className="flex items-center gap-3 mb-2">
                  <Mail size={18} className="text-brand-600" />
                  <span className="text-sm font-medium text-ink">Email Support</span>
                </div>
                <p className="text-sm text-ink-mute">
                  support@example.com
                </p>
                <p className="text-xs text-ink-mute mt-2">
                  Typically responds within 24 hours
                </p>
              </a>
              <a
                href="https://console.groq.com/docs"
                target="_blank"
                rel="noreferrer"
                className="card p-5 hover:shadow-pop transition-shadow"
              >
                <div className="flex items-center gap-3 mb-2">
                  <ExternalLink size={18} className="text-brand-600" />
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

          {/* Footer note */}
          <div className="mt-12 card p-6 bg-amber-50 border-amber-200">
            <p className="text-sm text-amber-900 leading-relaxed">
              <strong>Disclaimer:</strong> This tool assists with completeness review but does not
              provide legal advice and does not determine funding eligibility. Always verify your
              final application against the official grant requirements.
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
      className="card p-4 flex items-center gap-3 hover:shadow-pop hover:-translate-y-0.5 transition-all"
    >
      <div className="w-9 h-9 rounded-lg bg-brand-50 text-brand-600 flex items-center justify-center">
        <Icon size={16} />
      </div>
      <span className="text-sm font-medium text-ink">{label}</span>
    </a>
  );
}