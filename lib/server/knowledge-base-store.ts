import { randomUUID } from "node:crypto";
import { mkdir, readFile, unlink, writeFile } from "node:fs/promises";
import path from "node:path";
import {
  getInitialKnowledgeDocuments,
  type KnowledgeDocument,
} from "@/lib/knowledge-base-data";

const knowledgeBaseStorePath = path.join(
  process.cwd(),
  "data",
  "knowledge-base-documents.json"
);
const knowledgeBaseFilesDirectory = path.join(
  process.cwd(),
  "data",
  "knowledge-base-files"
);

type StoredKnowledgeDocument = KnowledgeDocument & {
  storedFileName?: string;
};

type CreateKnowledgeBaseStoredDocumentInput = {
  name: string;
  category: KnowledgeDocument["category"];
  pages: number;
  mimeType: string;
  sizeInBytes: number;
  fileBuffer: Buffer;
};

function toKnowledgeDocument(document: StoredKnowledgeDocument): KnowledgeDocument {
  return {
    id: document.id,
    name: document.name,
    category: document.category,
    uploadedAt: document.uploadedAt,
    pages: document.pages,
    sizeInBytes: document.sizeInBytes,
    mimeType: document.mimeType,
    downloadUrl: document.storedFileName
      ? `/api/knowledge-base/documents/${document.id}/file`
      : undefined,
  };
}

function sanitizeKnowledgeFileName(name: string) {
  const sanitizedName = name
    .replace(/[^a-zA-Z0-9._-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

  return sanitizedName.length > 0 ? sanitizedName : "document";
}

async function ensureKnowledgeBaseDirectories() {
  await Promise.all([
    mkdir(path.dirname(knowledgeBaseStorePath), { recursive: true }),
    mkdir(knowledgeBaseFilesDirectory, { recursive: true }),
  ]);
}

async function ensureKnowledgeBaseStore() {
  await ensureKnowledgeBaseDirectories();

  try {
    await readFile(knowledgeBaseStorePath, "utf8");
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== "ENOENT") {
      throw error;
    }

    await writeKnowledgeBaseDocuments(getInitialKnowledgeDocuments());
  }
}

async function writeKnowledgeBaseDocuments(documents: StoredKnowledgeDocument[]) {
  await writeFile(
    knowledgeBaseStorePath,
    `${JSON.stringify(documents, null, 2)}\n`,
    "utf8"
  );
}

export async function listKnowledgeBaseDocuments() {
  await ensureKnowledgeBaseStore();

  const fileContents = await readFile(knowledgeBaseStorePath, "utf8");
  const documents = JSON.parse(fileContents) as StoredKnowledgeDocument[];
  return documents.map(toKnowledgeDocument);
}

export async function createKnowledgeBaseDocument(
  input: CreateKnowledgeBaseStoredDocumentInput
) {
  await ensureKnowledgeBaseStore();

  const fileContents = await readFile(knowledgeBaseStorePath, "utf8");
  const documents = JSON.parse(fileContents) as StoredKnowledgeDocument[];
  const documentId = `DOC-${randomUUID().slice(0, 8)}`;
  const storedFileName = `${documentId}-${sanitizeKnowledgeFileName(input.name)}`;

  await writeFile(
    path.join(knowledgeBaseFilesDirectory, storedFileName),
    input.fileBuffer
  );

  const nextDocument: StoredKnowledgeDocument = {
    id: documentId,
    name: input.name,
    category: input.category,
    uploadedAt: new Date().toISOString().slice(0, 10),
    pages: input.pages,
    sizeInBytes: input.sizeInBytes,
    mimeType: input.mimeType,
    storedFileName,
  };

  await writeKnowledgeBaseDocuments([nextDocument, ...documents]);

  return toKnowledgeDocument(nextDocument);
}

export async function deleteKnowledgeBaseDocument(id: string) {
  await ensureKnowledgeBaseStore();

  const fileContents = await readFile(knowledgeBaseStorePath, "utf8");
  const documents = JSON.parse(fileContents) as StoredKnowledgeDocument[];
  const documentToDelete = documents.find((document) => document.id === id);
  const nextDocuments = documents.filter((document) => document.id !== id);

  if (nextDocuments.length === documents.length) {
    return false;
  }

  if (documentToDelete?.storedFileName) {
    await unlink(
      path.join(knowledgeBaseFilesDirectory, documentToDelete.storedFileName)
    ).catch((error) => {
      if ((error as NodeJS.ErrnoException).code !== "ENOENT") {
        throw error;
      }
    });
  }

  await writeKnowledgeBaseDocuments(nextDocuments);
  return true;
}

export async function getKnowledgeBaseDocumentFile(id: string) {
  await ensureKnowledgeBaseStore();

  const fileContents = await readFile(knowledgeBaseStorePath, "utf8");
  const documents = JSON.parse(fileContents) as StoredKnowledgeDocument[];
  const document = documents.find((candidate) => candidate.id === id);

  if (!document?.storedFileName) {
    return null;
  }

  const fileBuffer = await readFile(
    path.join(knowledgeBaseFilesDirectory, document.storedFileName)
  ).catch((error) => {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      return null;
    }

    throw error;
  });

  if (!fileBuffer) {
    return null;
  }

  return {
    document: toKnowledgeDocument(document),
    fileBuffer,
    mimeType: document.mimeType ?? "application/octet-stream",
    name: document.name,
  };
}
