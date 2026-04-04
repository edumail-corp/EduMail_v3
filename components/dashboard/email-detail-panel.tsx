import Link from "next/link";
import type { ReactNode } from "react";
import type { StaffEmail } from "@/lib/email-data";
import { EmailStatusBadge } from "@/components/dashboard/email-badges";

function DetailCard({
  title,
  subtitle,
  children,
}: Readonly<{
  title: string;
  subtitle?: string;
  children: ReactNode;
}>) {
  return (
    <article className="rounded-[24px] border border-white/70 bg-white/90 p-5 shadow-[0_18px_50px_rgba(15,23,42,0.08)] backdrop-blur">
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-slate-800">{title}</p>
          {subtitle ? (
            <p className="mt-1 text-xs font-medium text-slate-500">
              {subtitle}
            </p>
          ) : null}
        </div>
      </div>
      {children}
    </article>
  );
}

export function EmailDetailPanel({
  email,
  onApprove,
  isApproving = false,
  isEditingDraft = false,
  draftValue = "",
  onDraftChange,
  onStartEditing,
  onCancelEditing,
  onSaveDraft,
  isSavingDraft = false,
}: Readonly<{
  email?: StaffEmail;
  onApprove?: () => void;
  isApproving?: boolean;
  isEditingDraft?: boolean;
  draftValue?: string;
  onDraftChange?: (value: string) => void;
  onStartEditing?: () => void;
  onCancelEditing?: () => void;
  onSaveDraft?: () => void;
  isSavingDraft?: boolean;
}>) {
  if (!email) {
    return (
      <section className="rounded-[28px] border border-dashed border-slate-300 bg-white/60 p-10 text-center text-sm text-slate-500">
        Select a message to inspect the draft and review details.
      </section>
    );
  }

  const hasDraft = email.aiDraft !== null;
  const isAlreadySent = email.status === "Auto-sent";
  const canApprove =
    hasDraft &&
    !isAlreadySent &&
    !isApproving &&
    !isSavingDraft &&
    !isEditingDraft &&
    Boolean(onApprove);
  const canEnterEditMode =
    !isAlreadySent && !isApproving && !isSavingDraft && Boolean(onStartEditing);
  const canSaveDraft =
    draftValue.trim().length > 0 && !isSavingDraft && Boolean(onSaveDraft);

  let reviewMessage =
    "Approve this response to move it into the auto-sent queue and persist the decision.";

  if (isEditingDraft) {
    reviewMessage = "Update the draft, save it to the mailbox store, and approve it when the response is ready.";
  } else if (isAlreadySent) {
    reviewMessage = "This message has already been approved and moved into the sent queue.";
  } else if (!hasDraft) {
    reviewMessage = "No AI draft is available yet, so this case still needs a manual response.";
  } else if (isApproving || isSavingDraft) {
    reviewMessage = "Saving the decision and updating the mailbox state.";
  }

  const approveLabel = isApproving
    ? "Sending..."
    : isAlreadySent
      ? "Already Sent"
      : !hasDraft
        ? "Manual Review Required"
        : "Approve & Send";
  const editLabel = isAlreadySent
    ? "Locked After Send"
    : hasDraft
      ? "Edit Draft"
      : "Compose Draft";
  const saveDraftLabel = isSavingDraft ? "Saving..." : "Save Draft";

  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-[28px] border border-white/70 bg-white/80 px-5 py-5 shadow-[0_18px_50px_rgba(15,23,42,0.08)] backdrop-blur md:px-6">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#2E5FA3]">
            Message Detail
          </p>
          <h3 className="mt-2 text-2xl font-semibold tracking-tight text-slate-900">
            Review Draft
          </h3>
        </div>
        <EmailStatusBadge status={email.status} />
      </div>

      <DetailCard title="Original Message" subtitle={email.sender}>
        <p className="text-sm text-slate-500">Subject</p>
        <p className="mb-4 mt-1 text-base font-semibold text-slate-900">
          {email.subject}
        </p>
        <p className="text-sm text-slate-500">Message</p>
        <p className="mt-1 whitespace-pre-line text-sm leading-6 text-slate-700">
          {email.body}
        </p>
      </DetailCard>

      <DetailCard
        title="AI Draft Response"
        subtitle={email.source ?? "No source attached"}
      >
        {email.source ? (
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-blue-100 bg-blue-50/70 px-4 py-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#2E5FA3]">
                Retrieved Source
              </p>
              <p className="mt-1 text-sm font-medium text-slate-700">
                {email.source}
              </p>
            </div>
            <Link
              href={`/dashboard/knowledge-base?document=${encodeURIComponent(email.source)}`}
              className="rounded-xl border border-[#2E5FA3]/20 bg-white px-3 py-2 text-xs font-semibold text-[#2E5FA3] transition hover:bg-blue-100"
            >
              Open in Library
            </Link>
          </div>
        ) : null}

        {isEditingDraft ? (
          <div className="space-y-3">
            <textarea
              value={draftValue}
              onChange={(event) => onDraftChange?.(event.target.value)}
              rows={10}
              className="w-full rounded-[20px] border border-slate-200 bg-slate-50 px-4 py-3 text-sm leading-6 text-slate-700 outline-none transition focus:border-[#2E5FA3] focus:bg-white"
              placeholder="Write the response that should be sent to the student or staff member."
            />
            <p className="text-xs font-medium text-slate-500">
              Saving this draft will persist it for the current prototype mailbox.
            </p>
          </div>
        ) : email.aiDraft ? (
          <p className="whitespace-pre-line text-sm leading-6 text-slate-700">
            {email.aiDraft}
          </p>
        ) : (
          <p className="text-sm leading-6 text-slate-500">
            No AI draft generated for this message. Manual intervention required.
          </p>
        )}
      </DetailCard>

      <DetailCard title="Review Signals" subtitle="Confidence and next action">
        <div className="flex items-center justify-between gap-3">
          <p className="text-sm font-medium text-slate-600">Confidence Score</p>
          <span className="text-sm font-semibold text-[#2E5FA3]">
            {email.confidence}%
          </span>
        </div>
        <div className="mt-3 h-2.5 w-full rounded-full bg-slate-200">
          <div
            className="h-2.5 rounded-full bg-gradient-to-r from-[#5b8fdb] to-[#1F3864]"
            style={{ width: `${email.confidence}%` }}
          />
        </div>

        <p className="mt-5 text-sm leading-6 text-slate-500">{reviewMessage}</p>

        <div className="mt-5 flex flex-wrap gap-3">
          {isEditingDraft ? (
            <>
              <button
                type="button"
                onClick={onSaveDraft}
                disabled={!canSaveDraft}
                className={`rounded-xl px-4 py-2.5 text-sm font-semibold transition ${
                  canSaveDraft
                    ? "bg-[#1F3864] text-white hover:bg-[#172b4e]"
                    : "cursor-not-allowed bg-slate-200 text-slate-500"
                }`}
              >
                {saveDraftLabel}
              </button>
              <button
                type="button"
                onClick={onCancelEditing}
                disabled={isSavingDraft}
                className={`rounded-xl border px-4 py-2.5 text-sm font-semibold transition ${
                  isSavingDraft
                    ? "cursor-not-allowed border-slate-200 bg-slate-100 text-slate-400"
                    : "border-[#2E5FA3]/20 bg-blue-50 text-[#2E5FA3] hover:bg-blue-100"
                }`}
              >
                Cancel
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={onApprove}
                disabled={!canApprove}
                className={`rounded-xl px-4 py-2.5 text-sm font-semibold transition ${
                  canApprove
                    ? "bg-[#1F3864] text-white hover:bg-[#172b4e]"
                    : "cursor-not-allowed bg-slate-200 text-slate-500"
                }`}
              >
                {approveLabel}
              </button>
              <button
                type="button"
                onClick={onStartEditing}
                disabled={!canEnterEditMode}
                className={`rounded-xl border px-4 py-2.5 text-sm font-semibold transition ${
                  canEnterEditMode
                    ? "border-[#2E5FA3]/20 bg-blue-50 text-[#2E5FA3] hover:bg-blue-100"
                    : "cursor-not-allowed border-slate-200 bg-slate-100 text-slate-500"
                }`}
              >
                {editLabel}
              </button>
            </>
          )}
        </div>
      </DetailCard>
    </section>
  );
}
