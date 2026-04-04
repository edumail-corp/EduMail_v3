import Link from "next/link";
import {
  EmailCategoryBadge,
  EmailStatusBadge,
} from "@/components/dashboard/email-badges";
import { DashboardPageHeader } from "@/components/dashboard/dashboard-page-header";
import { dashboardNavItems, formatEmailDate } from "@/lib/dashboard";
import { listStaffEmails } from "@/lib/server/email-store";
import { listKnowledgeBaseDocuments } from "@/lib/server/knowledge-base-store";

const overviewCardStyles = [
  "from-[#eff6ff] to-white",
  "from-[#fff7ed] to-white",
  "from-[#fff1f2] to-white",
  "from-[#ecfdf5] to-white",
] as const;

export default async function DashboardRootPage() {
  const [emails, documents] = await Promise.all([
    listStaffEmails(),
    listKnowledgeBaseDocuments(),
  ]);

  const draftCount = emails.filter((email) => email.status === "Draft").length;
  const escalatedCount = emails.filter(
    (email) => email.status === "Escalated"
  ).length;
  const sentCount = emails.filter((email) => email.status === "Auto-sent").length;
  const recentEmails = [...emails]
    .sort(
      (left, right) =>
        new Date(right.receivedAt).getTime() - new Date(left.receivedAt).getTime()
    )
    .slice(0, 4);

  const overviewCards = [
    {
      href: "/dashboard/inbox",
      label: "Mailbox Queue",
      value: `${emails.length}`,
      description: "Tracked inbound messages across the current workspace.",
    },
    {
      href: "/dashboard/drafts",
      label: "Drafts Awaiting Review",
      value: `${draftCount}`,
      description: "Messages ready for editing, approval, or final sign-off.",
    },
    {
      href: "/dashboard/escalations",
      label: "Escalations Open",
      value: `${escalatedCount}`,
      description: "Cases that still need manual guidance before a response goes out.",
    },
    {
      href: "/dashboard/knowledge-base",
      label: "Library Documents",
      value: `${documents.length}`,
      description: "Policy and operations documents available to support responses.",
    },
  ] as const;

  return (
    <>
      <DashboardPageHeader
        eyebrow="Workspace Overview"
        title="Operations Snapshot"
        description="See the current state of the mailbox, jump into the highest-priority queues, and keep the document library in view before you start triaging."
        meta={`${sentCount} messages already approved`}
        actions={
          <Link
            href="/dashboard/inbox"
            className="rounded-2xl bg-[#1F3864] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#172b4e]"
          >
            Open Inbox
          </Link>
        }
      />

      <section className="grid gap-4 xl:grid-cols-4">
        {overviewCards.map((card, index) => (
          <Link
            key={card.href}
            href={card.href}
            className={`rounded-[28px] border border-white/70 bg-gradient-to-br ${overviewCardStyles[index]} p-5 shadow-[0_18px_50px_rgba(15,23,42,0.08)] transition hover:-translate-y-0.5 hover:shadow-[0_24px_60px_rgba(15,23,42,0.12)]`}
          >
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#2E5FA3]">
              {card.label}
            </p>
            <p className="mt-4 text-4xl font-semibold tracking-tight text-slate-900">
              {card.value}
            </p>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              {card.description}
            </p>
          </Link>
        ))}
      </section>

      <section className="mt-4 grid gap-4 xl:grid-cols-[minmax(0,1.2fr)_minmax(320px,0.8fr)]">
        <article className="rounded-[28px] border border-white/70 bg-white/85 p-5 shadow-[0_18px_50px_rgba(15,23,42,0.08)] backdrop-blur md:p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#2E5FA3]">
                Recent Activity
              </p>
              <h3 className="mt-2 text-xl font-semibold text-slate-900">
                Latest Messages
              </h3>
            </div>
            <Link
              href="/dashboard/inbox"
              className="text-sm font-semibold text-[#2E5FA3] transition hover:text-[#1F3864]"
            >
              View full queue
            </Link>
          </div>

          <div className="mt-5 space-y-3">
            {recentEmails.map((email) => (
              <Link
                key={email.id}
                href={`/dashboard/inbox?emailId=${encodeURIComponent(email.id)}`}
                className="block rounded-[22px] border border-slate-200/80 bg-slate-50/80 p-4 transition hover:border-[#2E5FA3]/30 hover:bg-white"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-slate-900">
                      {email.subject}
                    </p>
                    <p className="mt-1 text-sm text-slate-500">{email.sender}</p>
                  </div>
                  <span className="text-xs font-medium text-slate-500">
                    {formatEmailDate(email.receivedAt)}
                  </span>
                </div>

                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <EmailStatusBadge status={email.status} />
                  <EmailCategoryBadge category={email.category} />
                </div>
              </Link>
            ))}
          </div>
        </article>

        <div className="space-y-4">
          <article className="rounded-[28px] border border-white/70 bg-white/85 p-5 shadow-[0_18px_50px_rgba(15,23,42,0.08)] backdrop-blur md:p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#2E5FA3]">
              Queue Health
            </p>
            <h3 className="mt-2 text-xl font-semibold text-slate-900">
              Today&apos;s Posture
            </h3>

            <div className="mt-5 space-y-4">
              <div>
                <div className="mb-2 flex items-center justify-between text-sm text-slate-600">
                  <span>Draft coverage</span>
                  <span>{draftCount} waiting review</span>
                </div>
                <div className="h-2.5 rounded-full bg-slate-200">
                  <div
                    className="h-2.5 rounded-full bg-gradient-to-r from-amber-300 to-amber-500"
                    style={{
                      width: `${emails.length === 0 ? 0 : (draftCount / emails.length) * 100}%`,
                    }}
                  />
                </div>
              </div>

              <div>
                <div className="mb-2 flex items-center justify-between text-sm text-slate-600">
                  <span>Escalation load</span>
                  <span>{escalatedCount} active</span>
                </div>
                <div className="h-2.5 rounded-full bg-slate-200">
                  <div
                    className="h-2.5 rounded-full bg-gradient-to-r from-rose-300 to-rose-500"
                    style={{
                      width: `${emails.length === 0 ? 0 : (escalatedCount / emails.length) * 100}%`,
                    }}
                  />
                </div>
              </div>

              <div>
                <div className="mb-2 flex items-center justify-between text-sm text-slate-600">
                  <span>Approved responses</span>
                  <span>{sentCount} complete</span>
                </div>
                <div className="h-2.5 rounded-full bg-slate-200">
                  <div
                    className="h-2.5 rounded-full bg-gradient-to-r from-emerald-300 to-emerald-500"
                    style={{
                      width: `${emails.length === 0 ? 0 : (sentCount / emails.length) * 100}%`,
                    }}
                  />
                </div>
              </div>
            </div>
          </article>

          <article className="rounded-[28px] border border-white/70 bg-white/85 p-5 shadow-[0_18px_50px_rgba(15,23,42,0.08)] backdrop-blur md:p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#2E5FA3]">
              Quick Access
            </p>
            <h3 className="mt-2 text-xl font-semibold text-slate-900">
              Workspace Shortcuts
            </h3>

            <div className="mt-5 space-y-3">
              {dashboardNavItems.slice(1).map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex items-center justify-between rounded-[20px] border border-slate-200/80 bg-slate-50/80 px-4 py-3 text-sm font-medium text-slate-700 transition hover:border-[#2E5FA3]/30 hover:bg-white"
                >
                  <span>{item.label}</span>
                  <span className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">
                    {item.shortLabel}
                  </span>
                </Link>
              ))}
            </div>
          </article>
        </div>
      </section>
    </>
  );
}
