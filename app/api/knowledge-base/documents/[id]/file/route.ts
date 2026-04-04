import { NextResponse } from "next/server";
import { getKnowledgeBaseDocumentFile } from "@/lib/server/knowledge-base-store";

export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const fileData = await getKnowledgeBaseDocumentFile(id);

  if (!fileData) {
    return NextResponse.json(
      { error: "Document file not found." },
      { status: 404 }
    );
  }

  return new NextResponse(fileData.fileBuffer, {
    status: 200,
    headers: {
      "Content-Type": fileData.mimeType,
      "Content-Disposition": `attachment; filename="${encodeURIComponent(fileData.name)}"`,
      "Cache-Control": "no-store",
    },
  });
}
