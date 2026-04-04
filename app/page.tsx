import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(46,95,163,0.18),_transparent_28%),linear-gradient(180deg,#f6f9ff_0%,#f8fafc_38%,#f8fafc_100%)] px-6 py-10 text-slate-900">
      <div className="mx-auto flex min-h-[calc(100vh-5rem)] max-w-6xl items-center">
        <div className="grid w-full gap-6 lg:grid-cols-[minmax(0,1.08fr)_minmax(320px,0.72fr)]">
          <section className="rounded-[32px] border border-white/70 bg-white/80 p-8 shadow-[0_24px_80px_rgba(15,23,42,0.10)] backdrop-blur md:p-10">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#2E5FA3]">
              University Operations
            </p>
            <h1 className="mt-4 max-w-3xl text-4xl font-semibold tracking-tight text-slate-950 md:text-6xl">
              Triage faster, answer with confidence, and keep policy context close.
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-8 text-slate-600 md:text-lg">
              EduMailAI is a staff-facing workspace for reviewing inbound student emails,
              checking AI-generated drafts, and managing the knowledge documents those
              replies depend on.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/dashboard/inbox"
                className="inline-flex items-center rounded-xl bg-[#1F3864] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#172b4e]"
              >
                Open Staff Dashboard
              </Link>
              <Link
                href="/dashboard/knowledge-base"
                className="inline-flex items-center rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                View Knowledge Base
              </Link>
            </div>

            <div className="mt-10 grid gap-3 sm:grid-cols-3">
              <div className="rounded-2xl border border-slate-200 bg-slate-50/90 p-4">
                <p className="text-2xl font-semibold text-slate-900">3</p>
                <p className="mt-1 text-sm text-slate-600">review queues</p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50/90 p-4">
                <p className="text-2xl font-semibold text-slate-900">5</p>
                <p className="mt-1 text-sm text-slate-600">seeded email cases</p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50/90 p-4">
                <p className="text-2xl font-semibold text-slate-900">4</p>
                <p className="mt-1 text-sm text-slate-600">policy categories</p>
              </div>
            </div>
          </section>

          <aside className="rounded-[32px] border border-[#1F3864]/10 bg-[#10233f] p-6 text-white shadow-[0_24px_80px_rgba(15,23,42,0.18)] md:p-8">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-blue-200/70">
              Current Prototype
            </p>
            <h2 className="mt-4 text-2xl font-semibold tracking-tight">
              What the product already covers
            </h2>

            <div className="mt-6 space-y-4">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-sm font-semibold text-white">Inbox Review</p>
                <p className="mt-2 text-sm leading-6 text-blue-100/80">
                  Browse incoming messages, inspect the original request, and compare the generated response.
                </p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-sm font-semibold text-white">Draft and Escalation Queues</p>
                <p className="mt-2 text-sm leading-6 text-blue-100/80">
                  Separate what needs review from what needs deeper human intervention.
                </p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-sm font-semibold text-white">Knowledge Base Intake</p>
                <p className="mt-2 text-sm leading-6 text-blue-100/80">
                  Stage local PDF and DOCX files, assign categories, and add them to the document library prototype.
                </p>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}
