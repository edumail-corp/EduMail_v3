import { NextResponse } from "next/server";
import { deleteKnowledgeBaseDocument } from "@/lib/server/knowledge-base-store";

export const dynamic = "force-dynamic";

export async function DELETE(
  _request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const wasDeleted = await deleteKnowledgeBaseDocument(id);

  if (!wasDeleted) {
    return NextResponse.json(
      { error: "Document not found." },
      { status: 404 }
    );
  }

  return new NextResponse(null, { status: 204 });
}
