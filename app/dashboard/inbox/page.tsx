import { MailboxView } from "@/components/dashboard/mailbox-view";

export default function InboxPage() {
  return (
    <MailboxView
      filter="All"
      eyebrow="Operations"
      title="Inbox"
      description="Browse the full message queue, inspect the retrieved context, and decide whether the suggested response is ready to move forward."
      metaSuffix="total messages"
      listTitle="Message Queue"
      listDescription="All captured inbound messages across the current prototype mailbox."
      emptyMessage="No messages available."
    />
  );
}
