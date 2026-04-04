import type { StaffEmail } from "@/lib/email-data";
import { formatEmailDate } from "@/lib/dashboard";
import {
  EmailCategoryBadge,
  EmailStatusBadge,
} from "@/components/dashboard/email-badges";

export function EmailList({
  title,
  description,
  emails,
  selectedId,
  onSelect,
  emptyMessage,
}: Readonly<{
  title: string;
  description: string;
  emails: StaffEmail[];
  selectedId: string;
  onSelect: (id: string) => void;
  emptyMessage: string;
}>) {
  return (
    <section className="overflow-hidden rounded-[28px] border border-white/70 bg-white/80 shadow-[0_18px_50px_rgba(15,23,42,0.08)] backdrop-blur">
      <div className="border-b border-slate-200/80 px-5 py-5 md:px-6">
        <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
        <p className="mt-1 text-sm text-slate-500">{description}</p>
      </div>

      {emails.length === 0 ? (
        <div className="px-6 py-16 text-center text-sm text-slate-500">
          {emptyMessage}
        </div>
      ) : (
        <div className="max-h-[calc(100vh-18rem)] overflow-y-auto">
          {emails.map((email) => {
            const isSelected = email.id === selectedId;

            return (
              <button
                key={email.id}
                type="button"
                onClick={() => onSelect(email.id)}
                className={`w-full border-b border-slate-100 px-5 py-4 text-left transition last:border-b-0 md:px-6 ${
                  isSelected
                    ? "bg-blue-50/90"
                    : "bg-white/40 hover:bg-slate-50/90"
                }`}
              >
                <div className="mb-2 flex items-center justify-between gap-3">
                  <p className="truncate text-sm font-semibold text-slate-800">
                    {email.sender}
                  </p>
                  <span className="shrink-0 text-xs font-medium text-slate-500">
                    {formatEmailDate(email.receivedAt)}
                  </span>
                </div>

                <p className="truncate text-sm font-medium text-slate-700">
                  {email.subject}
                </p>

                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <EmailStatusBadge status={email.status} />
                  <EmailCategoryBadge category={email.category} />
                </div>
              </button>
            );
          })}
        </div>
      )}
    </section>
  );
}
