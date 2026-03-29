"use client";

import { useMemo, useState, type DragEvent } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

type DocCategory = "Admissions" | "Finance" | "Registrar" | "Academic";

type KnowledgeDocument = {
  id: string;
  name: string;
  category: DocCategory;
  uploadedAt: string;
  pages: number;
};

const categoryColors: Record<DocCategory, string> = {
  Admissions: "bg-blue-100 text-blue-700",
  Finance: "bg-indigo-100 text-indigo-700",
  Registrar: "bg-sky-100 text-sky-700",
  Academic: "bg-cyan-100 text-cyan-700",
};

const initialDocuments: KnowledgeDocument[] = [
  {
    id: "DOC-1",
    name: "Admissions-International-Policy-2026.pdf",
    category: "Admissions",
    uploadedAt: "2026-03-20",
    pages: 34,
  },
  {
    id: "DOC-2",
    name: "Student-Billing-Handbook-2026.docx",
    category: "Finance",
    uploadedAt: "2026-03-18",
    pages: 21,
  },
  {
    id: "DOC-3",
    name: "Transcript-Request-Workflow-v4.pdf",
    category: "Registrar",
    uploadedAt: "2026-03-14",
    pages: 12,
  },
  {
    id: "DOC-4",
    name: "Academic-Records-SOP-2026.pdf",
    category: "Academic",
    uploadedAt: "2026-03-10",
    pages: 27,
  },
  {
    id: "DOC-5",
    name: "Academic-Calendar-2026.pdf",
    category: "Registrar",
    uploadedAt: "2026-03-08",
    pages: 9,
  },
];

export default function KnowledgeBasePage() {
  const pathname = usePathname();
  const [isDragging, setIsDragging] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("Select category");
  const [activeFilter, setActiveFilter] = useState<"All" | DocCategory>("All");
  const [documents, setDocuments] = useState(initialDocuments);

  const navItems = [
    { label: "Inbox", href: "/dashboard/inbox" },
    { label: "Draft Queue", href: "/dashboard/drafts" },
    { label: "Escalations", href: "/dashboard/escalations" },
    { label: "Knowledge Base", href: "/dashboard/knowledge-base" },
  ];

  const visibleDocs = useMemo(() => {
    if (activeFilter === "All") {
      return documents;
    }
    return documents.filter((doc) => doc.category === activeFilter);
  }, [activeFilter, documents]);

  const handleDragOver = (event: DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (event: DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
    setIsDragging(false);
  };

  const handleDelete = (id: string) => {
    setDocuments((prev) => prev.filter((doc) => doc.id !== id));
  };

  return (
    <main className="min-h-screen bg-slate-100 text-slate-900">
      <div className="mx-auto grid min-h-screen max-w-[1600px] grid-cols-1 lg:grid-cols-[260px_1fr]">
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

        <section className="space-y-6 p-6">
          <article className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-xl font-semibold text-[#1F3864]">Upload</h2>
            <label
              htmlFor="kb-upload-input"
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed px-6 py-12 text-center transition ${
                isDragging ? "border-[#2E5FA3] bg-blue-50" : "border-slate-300 bg-slate-50"
              }`}
            >
              <span className="mb-2 text-4xl" role="img" aria-label="Upload cloud">
                ☁️
              </span>
              <p className="text-base font-medium text-slate-700">Drop files here or click to upload</p>
              <p className="mt-1 text-sm text-slate-500">Supported formats: PDF, DOCX</p>
            </label>
            <input id="kb-upload-input" type="file" className="sr-only" />

            <div className="mt-5 flex flex-wrap items-end gap-3">
              <div>
                <label htmlFor="kb-category" className="mb-1 block text-sm font-medium text-slate-700">
                  Category
                </label>
                <select
                  id="kb-category"
                  value={selectedCategory}
                  onChange={(event) => setSelectedCategory(event.target.value)}
                  className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 focus:border-[#2E5FA3] focus:outline-none"
                >
                  <option>Select category</option>
                  <option>Admissions</option>
                  <option>Finance</option>
                  <option>Registrar</option>
                  <option>Academic</option>
                </select>
              </div>

              <button
                type="button"
                className="rounded-lg bg-[#1F3864] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#172b4e]"
              >
                Upload
              </button>
            </div>
          </article>

          <article className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="mb-4 text-xl font-semibold text-[#1F3864]">Document Library</h3>

            <div className="mb-4 flex flex-wrap gap-2">
              {(["All", "Admissions", "Finance", "Registrar", "Academic"] as const).map((filter) => (
                <button
                  key={filter}
                  type="button"
                  onClick={() => setActiveFilter(filter)}
                  className={`rounded-full px-3 py-1 text-sm transition ${
                    activeFilter === filter
                      ? "bg-[#2E5FA3] text-white"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  {filter}
                </button>
              ))}
            </div>

            <div className="overflow-x-auto">
              <div className="min-w-[760px]">
                {visibleDocs.map((doc) => (
                  <div
                    key={doc.id}
                    className="grid grid-cols-[2fr_1fr_1fr_120px_90px] items-center gap-3 border-b border-slate-100 py-3"
                  >
                    <p className="truncate text-sm font-medium text-slate-800">{doc.name}</p>
                    <span
                      className={`justify-self-start rounded-full px-2.5 py-1 text-xs font-medium ${categoryColors[doc.category]}`}
                    >
                      {doc.category}
                    </span>
                    <p className="text-sm text-slate-600">{doc.uploadedAt}</p>
                    <p className="text-sm text-slate-600">{doc.pages} pages</p>
                    <button
                      type="button"
                      onClick={() => handleDelete(doc.id)}
                      className="justify-self-end rounded-md bg-red-100 px-2.5 py-1 text-xs font-semibold text-red-700 hover:bg-red-200"
                    >
                      Delete
                    </button>
                  </div>
                ))}

                {visibleDocs.length === 0 && (
                  <p className="py-8 text-center text-sm text-slate-500">
                    No documents found for the selected filter.
                  </p>
                )}
              </div>
            </div>
          </article>
        </section>
      </div>
    </main>
  );
}
