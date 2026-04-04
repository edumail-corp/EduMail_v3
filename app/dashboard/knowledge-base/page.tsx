"use client";

import {
  useDeferredValue,
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type DragEvent,
} from "react";
import { useSearchParams } from "next/navigation";
import { DashboardPageHeader } from "@/components/dashboard/dashboard-page-header";
import {
  acceptedKnowledgeFileExtensions,
  createKnowledgeDocumentDraft,
  defaultKnowledgeCategorySelection,
  filterKnowledgeDocuments,
  formatKnowledgeFileSize,
  isAcceptedKnowledgeFile,
  isKnowledgeCategorySelection,
  knowledgeBaseCategoryClasses,
  knowledgeBaseCategoryOptions,
  knowledgeBaseFilters,
  type KnowledgeBaseFilter,
  type KnowledgeCategorySelectValue,
  type KnowledgeDocument,
  type KnowledgeDocumentDraft,
} from "@/lib/knowledge-base-data";

type KnowledgeBaseDocumentsResponse = {
  documents: KnowledgeDocument[];
};

type KnowledgeBaseCreateResponse = {
  document: KnowledgeDocument;
};

type KnowledgeBaseErrorResponse = {
  error?: string;
};

function getKnowledgeBaseErrorMessage(data: unknown) {
  if (data && typeof data === "object" && "error" in data) {
    const error = data.error;

    if (typeof error === "string" && error.length > 0) {
      return error;
    }
  }

  return null;
}

function matchesKnowledgeDocumentSearch(
  document: KnowledgeDocument,
  query: string
) {
  if (query.length === 0) {
    return true;
  }

  const searchableText = [
    document.name,
    document.category,
    document.mimeType ?? "",
    document.uploadedAt,
  ]
    .join(" ")
    .toLowerCase();

  return searchableText.includes(query);
}

export default function KnowledgeBasePage() {
  const searchParams = useSearchParams();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [selectedCategory, setSelectedCategory] =
    useState<KnowledgeCategorySelectValue>(defaultKnowledgeCategorySelection);
  const [activeFilter, setActiveFilter] = useState<KnowledgeBaseFilter>("All");
  const [documents, setDocuments] = useState<KnowledgeDocument[]>([]);
  const [draftFile, setDraftFile] = useState<KnowledgeDocumentDraft | null>(
    null
  );
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadMessage, setUploadMessage] = useState<string | null>(null);
  const [libraryError, setLibraryError] = useState<string | null>(null);
  const [isLoadingDocuments, setIsLoadingDocuments] = useState(true);
  const [isSavingDocument, setIsSavingDocument] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [documentQuery, setDocumentQuery] = useState("");

  const requestedDocumentQuery = searchParams.get("document") ?? "";
  const normalizedRequestedDocumentQuery =
    requestedDocumentQuery.trim().toLowerCase();
  const deferredDocumentQuery = useDeferredValue(documentQuery);
  const normalizedDocumentQuery = deferredDocumentQuery.trim().toLowerCase();
  const visibleDocs = filterKnowledgeDocuments(documents, activeFilter).filter(
    (document) =>
      matchesKnowledgeDocumentSearch(document, normalizedDocumentQuery)
  );
  const storedDocumentCount = documents.filter(
    (document) => typeof document.downloadUrl === "string"
  ).length;

  const canUpload =
    draftFile !== null &&
    isKnowledgeCategorySelection(selectedCategory) &&
    !isSavingDocument;

  useEffect(() => {
    void loadDocuments();
  }, []);

  useEffect(() => {
    setDocumentQuery(requestedDocumentQuery);
    if (requestedDocumentQuery.length > 0) {
      setActiveFilter("All");
    }
  }, [requestedDocumentQuery]);

  useEffect(() => {
    if (normalizedRequestedDocumentQuery.length === 0 || isLoadingDocuments) {
      return;
    }

    const highlightedDocument = document.querySelector<HTMLElement>(
      '[data-requested-document="true"]'
    );

    highlightedDocument?.scrollIntoView({
      behavior: "smooth",
      block: "center",
    });
  }, [isLoadingDocuments, normalizedRequestedDocumentQuery, visibleDocs]);

  async function loadDocuments() {
    setIsLoadingDocuments(true);
    setLibraryError(null);

    try {
      const response = await fetch("/api/knowledge-base/documents", {
        cache: "no-store",
      });
      const data = (await response.json()) as
        | KnowledgeBaseDocumentsResponse
        | KnowledgeBaseErrorResponse;

      if (!response.ok || !("documents" in data)) {
        throw new Error(
          getKnowledgeBaseErrorMessage(data) ??
            "Unable to load the document library."
        );
      }

      setDocuments(data.documents);
    } catch (error) {
      setLibraryError(
        error instanceof Error
          ? error.message
          : "Unable to load the document library."
      );
    } finally {
      setIsLoadingDocuments(false);
    }
  }

  const stageFile = (file: File | null) => {
    if (!file) {
      return;
    }

    setUploadMessage(null);

    if (!isAcceptedKnowledgeFile(file)) {
      setDraftFile(null);
      setUploadError("Only PDF and DOCX files can be staged in this prototype.");
      return;
    }

    setDraftFile(createKnowledgeDocumentDraft(file));
    setUploadError(null);
  };

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
    stageFile(event.dataTransfer.files[0] ?? null);
  };

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    stageFile(event.target.files?.[0] ?? null);
  };

  const handleDelete = (id: string) => {
    void deleteDocument(id);
  };

  const handleUpload = () => {
    void uploadDocument();
  };

  async function uploadDocument() {
    if (!draftFile) {
      setUploadError("Select a file before adding it to the library.");
      return;
    }

    if (!isKnowledgeCategorySelection(selectedCategory)) {
      setUploadError("Choose a category before adding the document.");
      return;
    }

    setIsSavingDocument(true);
    setUploadError(null);
    setUploadMessage(null);

    try {
      const formData = new FormData();
      formData.append("file", draftFile.file);
      formData.append("category", selectedCategory);

      const response = await fetch("/api/knowledge-base/documents", {
        method: "POST",
        body: formData,
      });

      const data = (await response.json()) as
        | KnowledgeBaseCreateResponse
        | KnowledgeBaseErrorResponse;

      if (!response.ok || !("document" in data)) {
        throw new Error(
          getKnowledgeBaseErrorMessage(data) ?? "Unable to add the document."
        );
      }

      setDocuments((prev) => [data.document, ...prev]);
      setDraftFile(null);
      setSelectedCategory(defaultKnowledgeCategorySelection);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      setUploadMessage(`${data.document.name} was added to the library.`);
      setActiveFilter("All");
    } catch (error) {
      setUploadError(
        error instanceof Error ? error.message : "Unable to add the document."
      );
    } finally {
      setIsSavingDocument(false);
    }
  }

  async function deleteDocument(id: string) {
    setDeletingId(id);
    setLibraryError(null);

    try {
      const response = await fetch(`/api/knowledge-base/documents/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const data = (await response.json().catch(() => null)) as
          | KnowledgeBaseErrorResponse
          | null;
        throw new Error(data?.error ?? "Unable to delete the document.");
      }

      setDocuments((prev) => prev.filter((document) => document.id !== id));
      setUploadMessage("Document removed from the library.");
    } catch (error) {
      setLibraryError(
        error instanceof Error
          ? error.message
          : "Unable to delete the document."
      );
    } finally {
      setDeletingId(null);
    }
  }

  const handleClearDraft = () => {
    setDraftFile(null);
    setUploadError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <>
      <DashboardPageHeader
        eyebrow="Reference Library"
        title="Knowledge Base"
        description="Keep source documents organized so the drafting workflow can cite the right policy, calendar, and operational guidance."
        meta={
          isLoadingDocuments
            ? "Loading library..."
            : `${storedDocumentCount} stored files • ${documents.length} total entries`
        }
      />

      <section className="space-y-4">
        <article className="rounded-[28px] border border-white/70 bg-white/80 p-5 shadow-[0_18px_50px_rgba(15,23,42,0.08)] backdrop-blur md:p-6">
          <div className="mb-5 flex flex-wrap items-start justify-between gap-4">
            <div>
              <h3 className="text-xl font-semibold text-slate-900">Document Intake</h3>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
                Stage a PDF or DOCX file, assign it to the right policy domain, and store the source document inside the local library.
              </p>
            </div>
            <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
              Stored Files
            </span>
          </div>

          <label
            htmlFor="kb-upload-input"
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`flex cursor-pointer flex-col items-center justify-center rounded-[24px] border-2 border-dashed px-6 py-12 text-center transition ${
              isDragging
                ? "border-[#2E5FA3] bg-blue-50"
                : "border-slate-300 bg-slate-50/80"
            }`}
          >
            <span className="mb-2 text-4xl" role="img" aria-label="Upload cloud">
              ☁️
            </span>
            <p className="text-base font-medium text-slate-700">
              Drop files here or click to stage a document
            </p>
            <p className="mt-1 text-sm text-slate-500">
              Supported formats: PDF, DOCX
            </p>
          </label>
          <input
            id="kb-upload-input"
            ref={fileInputRef}
            type="file"
            accept={acceptedKnowledgeFileExtensions.join(",")}
            onChange={handleFileChange}
            className="sr-only"
          />

          {draftFile ? (
            <div className="mt-4 rounded-2xl border border-blue-100 bg-blue-50/70 p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-slate-900">
                    Staged Document
                  </p>
                  <p className="mt-1 text-sm text-slate-700">{draftFile.name}</p>
                  <p className="mt-2 text-xs font-medium text-slate-500">
                    {draftFile.mimeTypeLabel} • {draftFile.sizeLabel} • Approx.{" "}
                    {draftFile.estimatedPages} pages
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleClearDraft}
                  className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 transition hover:bg-slate-100"
                >
                  Remove
                </button>
              </div>
            </div>
          ) : (
            <p className="mt-4 text-sm text-slate-500">
              No file staged yet. Choose a file or drop one into the intake area.
            </p>
          )}

          <div className="mt-5 flex flex-wrap items-end gap-3">
            <div>
              <label
                htmlFor="kb-category"
                className="mb-1 block text-sm font-medium text-slate-700"
              >
                Category
              </label>
              <select
                id="kb-category"
                value={selectedCategory}
                onChange={(event) =>
                  setSelectedCategory(
                    event.target.value as KnowledgeCategorySelectValue
                  )
                }
                className="rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-700 focus:border-[#2E5FA3] focus:outline-none"
              >
                <option>{defaultKnowledgeCategorySelection}</option>
                {knowledgeBaseCategoryOptions.map((category) => (
                  <option key={category}>{category}</option>
                ))}
              </select>
            </div>

            <button
              type="button"
              onClick={handleUpload}
              disabled={!canUpload}
              className={`rounded-xl px-4 py-2.5 text-sm font-semibold text-white transition ${
                canUpload
                  ? "bg-[#1F3864] hover:bg-[#172b4e]"
                  : "cursor-not-allowed bg-slate-300"
              }`}
            >
              {isSavingDocument ? "Saving..." : "Add to Library"}
            </button>
          </div>

          {uploadError ? (
            <p className="mt-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
              {uploadError}
            </p>
          ) : null}

          {uploadMessage ? (
            <p className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
              {uploadMessage}
            </p>
          ) : null}
        </article>

        <article className="rounded-[28px] border border-white/70 bg-white/80 p-5 shadow-[0_18px_50px_rgba(15,23,42,0.08)] backdrop-blur md:p-6">
          <div className="mb-5 flex flex-wrap items-center justify-between gap-4">
            <div>
              <h3 className="text-xl font-semibold text-slate-900">Document Library</h3>
              <p className="mt-2 text-sm text-slate-600">
                Filter the current source set by policy domain, download saved files, and manage the stored knowledge documents.
              </p>
            </div>
          </div>

          <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="w-full sm:max-w-lg">
              <label
                htmlFor="kb-document-search"
                className="mb-1 block text-sm font-medium text-slate-700"
              >
                Search documents
              </label>
              <input
                id="kb-document-search"
                type="search"
                value={documentQuery}
                onChange={(event) => setDocumentQuery(event.target.value)}
                placeholder="Search by name, category, date, or file type"
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-700 focus:border-[#2E5FA3] focus:outline-none"
              />
            </div>

            <button
              type="button"
              onClick={() => setDocumentQuery("")}
              disabled={documentQuery.length === 0}
              className={`rounded-xl px-4 py-2.5 text-sm font-semibold transition ${
                documentQuery.length > 0
                  ? "bg-slate-100 text-slate-700 hover:bg-slate-200"
                  : "cursor-not-allowed bg-slate-100 text-slate-400"
              }`}
            >
              Clear Search
            </button>
          </div>

          <div className="mb-5 flex flex-wrap gap-2">
            {knowledgeBaseFilters.map((filter) => (
              <button
                key={filter}
                type="button"
                onClick={() => setActiveFilter(filter)}
                className={`rounded-full px-3 py-1.5 text-sm font-medium transition ${
                  activeFilter === filter
                    ? "bg-[#2E5FA3] text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {filter}
              </button>
            ))}
          </div>

          <p className="mb-5 text-sm text-slate-500">
            {normalizedDocumentQuery.length > 0
              ? `${visibleDocs.length} documents match the current search.`
              : `${visibleDocs.length} documents shown for the selected category filter.`}
          </p>

          {normalizedRequestedDocumentQuery.length > 0 ? (
            <div className="mb-5 rounded-xl border border-blue-100 bg-blue-50 px-4 py-3 text-sm text-blue-800">
              Opened from a draft source reference. Matching documents are highlighted below.
            </div>
          ) : null}

          {libraryError ? (
            <div className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
              <p>{libraryError}</p>
              <button
                type="button"
                onClick={() => void loadDocuments()}
                className="rounded-lg border border-rose-200 bg-white px-3 py-1.5 text-xs font-semibold text-rose-700 transition hover:bg-rose-100"
              >
                Retry
              </button>
            </div>
          ) : null}

          <div className="overflow-x-auto">
            <div className="min-w-[760px]">
              <div className="mb-3 grid grid-cols-[minmax(220px,2fr)_1fr_1fr_120px_120px_150px] gap-3 px-1 text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                <p>Name</p>
                <p>Category</p>
                <p>Uploaded</p>
                <p>Pages</p>
                <p>Size</p>
                <p className="text-right">Actions</p>
              </div>

              {isLoadingDocuments ? (
                <p className="py-8 text-center text-sm text-slate-500">
                  Loading documents...
                </p>
              ) : null}

              {!isLoadingDocuments &&
                visibleDocs.map((doc) => {
                  const isRequestedDocument =
                    normalizedRequestedDocumentQuery.length > 0 &&
                    doc.name.toLowerCase().includes(normalizedRequestedDocumentQuery);

                  return (
                    <div
                      key={doc.id}
                      data-requested-document={
                        isRequestedDocument ? "true" : undefined
                      }
                      className={`grid grid-cols-[minmax(220px,2fr)_1fr_1fr_120px_120px_150px] items-center gap-3 border-b py-3 ${
                        isRequestedDocument
                          ? "border-blue-100 bg-blue-50/40"
                          : "border-slate-100"
                      }`}
                    >
                      <div>
                        <p className="truncate text-sm font-medium text-slate-800">
                          {doc.name}
                        </p>
                        {doc.mimeType ? (
                          <p className="mt-1 text-xs font-medium text-slate-500">
                            {doc.mimeType}
                          </p>
                        ) : null}
                      </div>
                      <span
                        className={`justify-self-start rounded-full px-2.5 py-1 text-xs font-semibold ${knowledgeBaseCategoryClasses[doc.category]}`}
                      >
                        {doc.category}
                      </span>
                      <p className="text-sm text-slate-600">{doc.uploadedAt}</p>
                      <p className="text-sm text-slate-600">{doc.pages} pages</p>
                      <p className="text-sm text-slate-600">
                        {typeof doc.sizeInBytes === "number"
                          ? formatKnowledgeFileSize(doc.sizeInBytes)
                          : "—"}
                      </p>
                      <div className="flex justify-end gap-2">
                        {doc.downloadUrl ? (
                          <a
                            href={doc.downloadUrl}
                            className="rounded-lg bg-slate-100 px-2.5 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-200"
                          >
                            Download
                          </a>
                        ) : (
                          <span className="rounded-lg bg-slate-100 px-2.5 py-1.5 text-xs font-semibold text-slate-400">
                            Metadata Only
                          </span>
                        )}
                        <button
                          type="button"
                          onClick={() => handleDelete(doc.id)}
                          disabled={deletingId === doc.id}
                          className={`rounded-lg px-2.5 py-1.5 text-xs font-semibold transition ${
                            deletingId === doc.id
                              ? "cursor-not-allowed bg-slate-200 text-slate-500"
                              : "bg-red-100 text-red-700 hover:bg-red-200"
                          }`}
                        >
                          {deletingId === doc.id ? "Deleting..." : "Delete"}
                        </button>
                      </div>
                    </div>
                  );
                })}

              {!isLoadingDocuments && visibleDocs.length === 0 ? (
                <p className="py-8 text-center text-sm text-slate-500">
                  {normalizedDocumentQuery.length > 0
                    ? "No documents match the current search."
                    : "No documents found for the selected filter."}
                </p>
              ) : null}
            </div>
          </div>
        </article>
      </section>
    </>
  );
}
