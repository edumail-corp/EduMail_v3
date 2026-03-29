"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { mockEmails, type StaffEmail } from "@/lib/mockData";

const statusColors: Record<StaffEmail["status"], string> = {
  Draft: "bg-amber-100 text-amber-800 border-amber-200",
  "Auto-sent": "bg-emerald-100 text-emerald-800 border-emerald-200",
  Escalated: "bg-rose-100 text-rose-800 border-rose-200",
};

const categoryColors: Record<StaffEmail["category"], string> = {
  Admissions: "bg-blue-100 text-blue-700",
  Finance: "bg-indigo-100 text-indigo-700",
  Registrar: "bg-sky-100 text-sky-700",
  Academic: "bg-cyan-100 text-cyan-700",
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleString(undefined, {
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function EscalationsPage() {
  const pathname = usePathname();
  const escalatedEmails = useMemo(
    () => mockEmails.filter((mail) => mail.status === "Escalated"),
    []
  );
  const [selectedId, setSelectedId] = useState(escalatedEmails[0]?.id ?? "");

  const selectedEmail = useMemo(
    () => escalatedEmails.find((mail) => mail.id === selectedId) ?? escalatedEmails[0],
    [selectedId, escalatedEmails]
  );

  const navItems = [
    { label: "Inbox", href: "/dashboard/inbox" },
    { label: "Draft Queue", href: "/dashboard/drafts" },
    { label: "Escalations", href: "/dashboard/escalations" },
    { label: "Knowledge Base", href: "/dashboard/knowledge-base" },
  ];

  return (
    <main className="min-h-screen bg-slate-100 text-slate-900">
      <div className="mx-auto grid min-h-screen max-w-[1600px] grid-cols-1 lg:grid-cols-[260px_1fr_1.15fr]">
        <aside className="border-r border-slate-200 bg-[#1F3864] px-6 py-8 text-white">
          <div className="mb-10">
            <div className="mb-2 inline-flex h-11 w-11 items-center justify-center rounded-lg bg-[#2E5FA3] text-lg font-bold">
              E
            </div>
            <h1 className="text-xl font-bold tracking-tight">EduMailAI</h1>
            <p className="mt-1 text-sm text-blue-100">Staff Email Dashboard</p>
          </div>

          <nav className="space-y-2 text-sm">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`block rounded-lg px-4 py-2 ${
                    isActive ? "bg-[#2E5FA3] font-medium" : "text-blue-100"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </aside>

        {escalatedEmails.length === 0 ? (
          <section className="flex items-center justify-center bg-white lg:col-span-2">
            <p className="text-lg font-medium text-slate-500">No escalations at this time</p>
          </section>
        ) : (
          <>
            <section className="border-r border-slate-200 bg-white">
              <div className="border-b border-slate-200 px-6 py-5">
                <h2 className="text-lg font-semibold">Escalations</h2>
                <p className="text-sm text-slate-500">
                  {escalatedEmails.length} escalated emails requiring action
                </p>
              </div>

              <div className="max-h-[calc(100vh-88px)] overflow-y-auto">
                {escalatedEmails.map((email) => {
                  const isSelected = selectedEmail?.id === email.id;
                  return (
                    <button
                      key={email.id}
                      onClick={() => setSelectedId(email.id)}
                      className={`w-full border-b border-slate-100 px-6 py-4 text-left transition hover:bg-slate-50 ${
                        isSelected ? "bg-blue-50" : "bg-white"
                      }`}
                    >
                      <div className="mb-2 flex items-center justify-between gap-2">
                        <p className="truncate text-sm font-semibold text-slate-800">{email.sender}</p>
                        <span className="text-xs text-slate-500">{formatDate(email.receivedAt)}</span>
                      </div>
                      <p className="truncate text-sm font-medium text-slate-700">{email.subject}</p>
                      <div className="mt-3 flex items-center gap-2">
                        <span
                          className={`rounded-full border px-2.5 py-1 text-xs font-medium ${statusColors[email.status]}`}
                        >
                          {email.status}
                        </span>
                        <span
                          className={`rounded-full px-2.5 py-1 text-xs font-medium ${categoryColors[email.category]}`}
                        >
                          {email.category}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </section>

            <section className="bg-slate-50 px-6 py-6">
              <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <h3 className="text-xl font-semibold text-[#1F3864]">Message Detail</h3>
                <span
                  className={`rounded-full border px-3 py-1 text-xs font-medium ${statusColors[selectedEmail.status]}`}
                >
                  {selectedEmail.status}
                </span>
              </div>

              <article className="mb-5 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                <p className="text-sm text-slate-500">From</p>
                <p className="mb-3 text-sm font-medium text-slate-800">{selectedEmail.sender}</p>
                <p className="text-sm text-slate-500">Subject</p>
                <p className="mb-3 text-base font-semibold">{selectedEmail.subject}</p>
                <p className="text-sm text-slate-500">Original message</p>
                <p className="mt-1 whitespace-pre-line text-sm leading-6 text-slate-700">{selectedEmail.body}</p>
              </article>

              <article className="mb-5 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="mb-3 flex items-center justify-between gap-3">
                  <p className="text-sm font-semibold text-slate-700">AI Draft Response</p>
                  <span className="text-xs text-slate-500">{selectedEmail.source ?? "No source attached"}</span>
                </div>
                {selectedEmail.aiDraft ? (
                  <p className="whitespace-pre-line text-sm leading-6 text-slate-700">{selectedEmail.aiDraft}</p>
                ) : (
                  <p className="text-sm text-slate-500">
                    No AI draft generated for this message. Manual intervention required.
                  </p>
                )}
              </article>

              <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="mb-2 flex items-center justify-between">
                  <p className="text-sm font-semibold text-slate-700">Confidence Score</p>
                  <span className="text-sm font-semibold text-[#2E5FA3]">{selectedEmail.confidence}%</span>
                </div>
                <div className="h-2 w-full rounded-full bg-slate-200">
                  <div
                    className="h-2 rounded-full bg-[#2E5FA3]"
                    style={{ width: `${selectedEmail.confidence}%` }}
                  />
                </div>

                <div className="mt-5 flex flex-wrap gap-3">
                  <button
                    type="button"
                    className="rounded-lg bg-[#1F3864] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#172b4e]"
                  >
                    Approve &amp; Send
                  </button>
                  <button
                    type="button"
                    className="rounded-lg border border-[#2E5FA3] bg-white px-4 py-2 text-sm font-semibold text-[#2E5FA3] transition hover:bg-blue-50"
                  >
                    Edit Draft
                  </button>
                </div>
              </article>
            </section>
          </>
        )}
      </div>
    </main>
  );
}
