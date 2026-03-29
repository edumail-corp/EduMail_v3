export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 px-6">
      <main className="w-full max-w-xl rounded-2xl border border-slate-200 bg-white px-8 py-12 text-center shadow-sm">
        <h1 className="mb-3 text-4xl font-bold text-[#1F3864]">EduMailAI</h1>
        <p className="mb-8 text-slate-600">
          University staff assistant for triaging inbound emails and reviewing AI-generated responses.
        </p>
        <a
          href="/dashboard/inbox"
          className="inline-flex rounded-lg bg-[#2E5FA3] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#1F3864]"
        >
          Open Staff Dashboard
        </a>
      </main>
    </div>
  );
}
