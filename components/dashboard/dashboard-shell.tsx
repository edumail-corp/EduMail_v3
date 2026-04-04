"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { dashboardNavItems } from "@/lib/dashboard";

export function DashboardShell({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(46,95,163,0.16),_transparent_30%),linear-gradient(180deg,#eff4ff_0%,#f8fafc_35%,#f8fafc_100%)] text-slate-900">
      <div className="mx-auto flex min-h-screen max-w-[1680px] flex-col lg:grid lg:grid-cols-[280px_minmax(0,1fr)]">
        <aside className="border-b border-white/60 bg-[#10233f] px-6 py-6 text-white shadow-[0_20px_60px_rgba(15,23,42,0.16)] lg:sticky lg:top-0 lg:h-screen lg:border-b-0 lg:border-r lg:px-7 lg:py-8">
          <div className="flex h-full flex-col">
            <div className="mb-8">
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-[#5b8fdb] via-[#2E5FA3] to-[#1F3864] text-lg font-semibold shadow-lg shadow-blue-950/30">
                E
              </div>
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-blue-200/70">
                Staff Workspace
              </p>
              <h1 className="mt-2 text-2xl font-semibold tracking-tight text-white">
                EduMailAI
              </h1>
              <p className="mt-2 max-w-xs text-sm leading-6 text-blue-100/80">
                Triage inbound university email, review AI drafts, and keep policy context close at hand.
              </p>
            </div>

            <nav className="space-y-2">
              {dashboardNavItems.map((item) => {
                const isActive = pathname === item.href;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`group flex items-center justify-between rounded-2xl px-4 py-3 text-sm font-medium transition ${
                      isActive
                        ? "bg-white text-slate-900 shadow-sm"
                        : "text-blue-100/80 hover:bg-white/10 hover:text-white"
                    }`}
                  >
                    <span>{item.label}</span>
                    <span
                      className={`text-xs transition ${
                        isActive
                          ? "text-slate-400"
                          : "text-blue-200/60 group-hover:text-blue-100/80"
                      }`}
                    >
                      {item.shortLabel}
                    </span>
                  </Link>
                );
              })}
            </nav>

            <div className="mt-auto rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-blue-200/70">
                Prototype
              </p>
              <p className="mt-2 text-sm leading-6 text-blue-100/80">
                Persistent mailbox actions and a live document library are now wired into the workspace.
              </p>
            </div>
          </div>
        </aside>

        <div className="min-w-0 px-4 py-4 sm:px-6 sm:py-6 lg:px-8 lg:py-8">
          {children}
        </div>
      </div>
    </div>
  );
}
