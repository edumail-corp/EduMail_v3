"use client";

import { useDeferredValue, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import type { EmailFilter, StaffEmail } from "@/lib/email-data";
import {
  filterEmails,
  getInitialSelectedEmailId,
  getSelectedEmail,
} from "@/lib/email-data";
import { DashboardPageHeader } from "@/components/dashboard/dashboard-page-header";
import { EmailDetailPanel } from "@/components/dashboard/email-detail-panel";
import { EmailList } from "@/components/dashboard/email-list";

type MailboxEmailsResponse = {
  emails: StaffEmail[];
};

type MailboxEmailResponse = {
  email: StaffEmail;
};

type MailboxErrorResponse = {
  error?: string;
};

function getMailboxErrorMessage(data: unknown) {
  if (data && typeof data === "object" && "error" in data) {
    const error = data.error;

    if (typeof error === "string" && error.length > 0) {
      return error;
    }
  }

  return null;
}

function matchesMailboxSearch(email: StaffEmail, query: string) {
  if (query.length === 0) {
    return true;
  }

  const searchableText = [
    email.sender,
    email.subject,
    email.body,
    email.category,
    email.source ?? "",
    email.aiDraft ?? "",
  ]
    .join(" ")
    .toLowerCase();

  return searchableText.includes(query);
}

export function MailboxView({
  eyebrow,
  title,
  description,
  metaSuffix,
  listTitle,
  listDescription,
  emptyMessage,
  filter,
}: Readonly<{
  eyebrow: string;
  title: string;
  description: string;
  metaSuffix: string;
  listTitle: string;
  listDescription: string;
  emptyMessage: string;
  filter: EmailFilter;
}>) {
  const searchParams = useSearchParams();
  const [emails, setEmails] = useState<StaffEmail[]>([]);
  const [selectedId, setSelectedId] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const [approvingId, setApprovingId] = useState<string | null>(null);
  const [isEditingDraft, setIsEditingDraft] = useState(false);
  const [draftValue, setDraftValue] = useState("");
  const [isSavingDraft, setIsSavingDraft] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const deferredSearchQuery = useDeferredValue(searchQuery);
  const normalizedSearchQuery = deferredSearchQuery.trim().toLowerCase();
  const visibleEmails = emails.filter((email) =>
    matchesMailboxSearch(email, normalizedSearchQuery)
  );
  const requestedEmailId = searchParams.get("emailId") ?? "";
  const selectedEmail = getSelectedEmail(visibleEmails, selectedId);
  const meta = isLoading ? "Loading messages..." : `${emails.length} ${metaSuffix}`;

  useEffect(() => {
    async function loadEmails() {
      setIsLoading(true);
      setLoadError(null);
      setActionError(null);
      setActionMessage(null);
      setSearchQuery("");

      try {
        const response = await fetch(
          `/api/emails?filter=${encodeURIComponent(filter)}`,
          {
            cache: "no-store",
          }
        );
        const data = (await response.json()) as
          | MailboxEmailsResponse
          | MailboxErrorResponse;

        if (!response.ok || !("emails" in data)) {
          throw new Error(
            getMailboxErrorMessage(data) ?? "Unable to load the mailbox."
          );
        }

        setEmails(data.emails);
      } catch (error) {
        setLoadError(
          error instanceof Error ? error.message : "Unable to load the mailbox."
        );
      } finally {
        setIsLoading(false);
      }
    }

    void loadEmails();
  }, [filter]);

  useEffect(() => {
    setSelectedId((currentId) => {
      if (visibleEmails.length === 0) {
        return "";
      }

      if (requestedEmailId.length > 0) {
        const requestedEmail = visibleEmails.find(
          (email) => email.id === requestedEmailId
        );

        if (requestedEmail) {
          return requestedEmail.id;
        }
      }

      return visibleEmails.some((email) => email.id === currentId)
        ? currentId
        : getInitialSelectedEmailId(visibleEmails);
    });
  }, [emails, normalizedSearchQuery, requestedEmailId]);

  useEffect(() => {
    setIsEditingDraft(false);
  }, [selectedEmail?.id]);

  useEffect(() => {
    if (!isEditingDraft) {
      setDraftValue(selectedEmail?.aiDraft ?? "");
    }
  }, [isEditingDraft, selectedEmail?.aiDraft]);

  async function handleApprove() {
    if (!selectedEmail || !selectedEmail.aiDraft || selectedEmail.status === "Auto-sent") {
      return;
    }

    setApprovingId(selectedEmail.id);
    setActionError(null);
    setActionMessage(null);

    try {
      const response = await fetch(`/api/emails/${selectedEmail.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status: "Auto-sent",
        }),
      });

      const data = (await response.json()) as
        | MailboxEmailResponse
        | MailboxErrorResponse;

      if (!response.ok || !("email" in data)) {
        throw new Error(
          getMailboxErrorMessage(data) ?? "Unable to update the message."
        );
      }

      setEmails((currentEmails) => {
        const nextEmails = currentEmails.map((email) =>
          email.id === data.email.id ? data.email : email
        );

        return filterEmails(nextEmails, filter);
      });
      setActionMessage(`"${data.email.subject}" moved to Auto-sent.`);
    } catch (error) {
      setActionError(
        error instanceof Error ? error.message : "Unable to update the message."
      );
    } finally {
      setApprovingId(null);
    }
  }

  function handleStartEditing() {
    if (!selectedEmail || selectedEmail.status === "Auto-sent") {
      return;
    }

    setDraftValue(selectedEmail.aiDraft ?? "");
    setActionError(null);
    setActionMessage(null);
    setIsEditingDraft(true);
  }

  function handleCancelEditing() {
    setDraftValue(selectedEmail?.aiDraft ?? "");
    setIsEditingDraft(false);
  }

  async function handleSaveDraft() {
    if (!selectedEmail || selectedEmail.status === "Auto-sent") {
      return;
    }

    const nextDraft = draftValue.trim();

    if (nextDraft.length === 0) {
      setActionError("Write a response before saving the draft.");
      return;
    }

    setIsSavingDraft(true);
    setActionError(null);
    setActionMessage(null);

    try {
      const response = await fetch(`/api/emails/${selectedEmail.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          aiDraft: nextDraft,
          status: selectedEmail.status === "Escalated" ? "Draft" : selectedEmail.status,
        }),
      });

      const data = (await response.json()) as
        | MailboxEmailResponse
        | MailboxErrorResponse;

      if (!response.ok || !("email" in data)) {
        throw new Error(
          getMailboxErrorMessage(data) ?? "Unable to save the draft."
        );
      }

      setEmails((currentEmails) => {
        const nextEmails = currentEmails.map((email) =>
          email.id === data.email.id ? data.email : email
        );

        return filterEmails(nextEmails, filter);
      });
      setIsEditingDraft(false);
      setActionMessage(
        selectedEmail.status === "Escalated"
          ? `"${data.email.subject}" now has a saved draft and moved to Draft.`
          : `Draft for "${data.email.subject}" was saved.`
      );
    } catch (error) {
      setActionError(
        error instanceof Error ? error.message : "Unable to save the draft."
      );
    } finally {
      setIsSavingDraft(false);
    }
  }

  return (
    <>
      <DashboardPageHeader
        eyebrow={eyebrow}
        title={title}
        description={description}
        meta={meta}
      />

      {loadError ? (
        <div className="mb-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {loadError}
        </div>
      ) : null}

      {actionError ? (
        <div className="mb-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {actionError}
        </div>
      ) : null}

      {actionMessage ? (
        <div className="mb-4 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          {actionMessage}
        </div>
      ) : null}

      <section className="mb-4 rounded-[24px] border border-white/70 bg-white/80 px-5 py-4 shadow-[0_18px_50px_rgba(15,23,42,0.08)] backdrop-blur md:px-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm font-semibold text-slate-900">Search Mailbox</p>
            <p className="mt-1 text-sm text-slate-500">
              Narrow the current queue by sender, subject, policy source, or draft content.
            </p>
          </div>

          <div className="flex w-full flex-col gap-3 sm:flex-row lg:max-w-xl">
            <input
              type="search"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Search sender, subject, body, or source"
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-[#2E5FA3] focus:bg-white"
            />
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              disabled={searchQuery.length === 0}
              className={`rounded-2xl px-4 py-3 text-sm font-semibold transition ${
                searchQuery.length > 0
                  ? "border border-[#2E5FA3]/20 bg-blue-50 text-[#2E5FA3] hover:bg-blue-100"
                  : "cursor-not-allowed border border-slate-200 bg-slate-100 text-slate-400"
              }`}
            >
              Clear
            </button>
          </div>
        </div>

        <p className="mt-4 text-sm text-slate-500">
          {normalizedSearchQuery.length > 0
            ? `${visibleEmails.length} of ${emails.length} messages match the current search.`
            : `${emails.length} messages loaded in this queue.`}
        </p>
      </section>

      <div className="grid gap-4 xl:grid-cols-[minmax(340px,0.92fr)_minmax(0,1.08fr)]">
        <EmailList
          title={listTitle}
          description={listDescription}
          emails={visibleEmails}
          selectedId={selectedEmail?.id ?? ""}
          onSelect={setSelectedId}
          emptyMessage={
            normalizedSearchQuery.length > 0
              ? "No messages match the current search."
              : emptyMessage
          }
        />
        <EmailDetailPanel
          email={selectedEmail}
          onApprove={handleApprove}
          isApproving={approvingId === selectedEmail?.id}
          isEditingDraft={isEditingDraft}
          draftValue={draftValue}
          onDraftChange={setDraftValue}
          onStartEditing={handleStartEditing}
          onCancelEditing={handleCancelEditing}
          onSaveDraft={handleSaveDraft}
          isSavingDraft={isSavingDraft}
        />
      </div>
    </>
  );
}
