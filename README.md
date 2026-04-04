## EduMailAI

EduMailAI is a Next.js prototype for a university staff workflow tool. The app helps operations teams triage inbound emails, review AI-generated draft responses, and manage the policy documents that support those replies.

## What’s in the prototype

- Staff dashboard shell with shared navigation and layout
- Inbox, Draft Queue, and Escalations review flows
- AI draft detail view with confidence indicators
- Knowledge Base document library with local client-side file staging for PDF and DOCX uploads

## App Routes

- `/` - product landing page
- `/dashboard/inbox` - full message queue
- `/dashboard/drafts` - draft-review queue
- `/dashboard/escalations` - escalation queue
- `/dashboard/knowledge-base` - knowledge document management

## Local Development

From the project directory, install dependencies and start the dev server:

```bash
npm install
npm run dev
```

Open `http://localhost:3000` with your browser to see the app.

## Verification

Use these commands to verify the project locally:

```bash
npm run lint
npm run build
```

Note: the production build uses `next/font` with Geist, so it may need network access the first time the build fetches the font files.

## Tech Stack

- Next.js 16 App Router
- React 19
- TypeScript
- Tailwind CSS 4

## Current Notes

- The message and document data are still in a shared local prototype data layer.
- The Knowledge Base upload flow is intentionally local and in-memory, so uploads do not persist across page reloads.
- The next logical step is wiring the shared data layer to real backend storage or APIs.
