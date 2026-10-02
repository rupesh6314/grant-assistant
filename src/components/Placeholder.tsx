"use client";

import Sidebar from "@/components/Sidebar";
import Topbar from "@/components/Topbar";

export default function Placeholder({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="flex min-h-screen bg-canvas">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Topbar breadcrumb={[title]} />
        <main className="flex-1 p-6 lg:p-8 max-w-[1400px] w-full">
          <h1 className="text-2xl font-bold text-ink mb-2">{title}</h1>
          <p className="text-sm text-ink-mute mb-8">{description}</p>
          <div className="card p-12 text-center">
            <p className="text-ink-soft">This section is coming soon.</p>
          </div>
        </main>
      </div>
    </div>
  );
}