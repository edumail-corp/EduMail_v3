import type { EmailCategory, EmailStatus } from "@/lib/email-data";

export const dashboardNavItems = [
  { label: "Overview", shortLabel: "Home", href: "/dashboard" },
  { label: "Inbox", shortLabel: "All", href: "/dashboard/inbox" },
  { label: "Draft Queue", shortLabel: "Review", href: "/dashboard/drafts" },
  { label: "Escalations", shortLabel: "Urgent", href: "/dashboard/escalations" },
  {
    label: "Knowledge Base",
    shortLabel: "Docs",
    href: "/dashboard/knowledge-base",
  },
] as const;

export const emailStatusClasses: Record<EmailStatus, string> = {
  Draft: "border-amber-200 bg-amber-100 text-amber-800",
  "Auto-sent": "border-emerald-200 bg-emerald-100 text-emerald-800",
  Escalated: "border-rose-200 bg-rose-100 text-rose-800",
};

export const emailCategoryClasses: Record<EmailCategory, string> = {
  Admissions: "bg-blue-100 text-blue-700",
  Finance: "bg-indigo-100 text-indigo-700",
  Registrar: "bg-sky-100 text-sky-700",
  Academic: "bg-cyan-100 text-cyan-700",
};

export function formatEmailDate(iso: string) {
  return new Date(iso).toLocaleString(undefined, {
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}
