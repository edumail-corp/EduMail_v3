import { NextResponse } from "next/server";
import { isEmailStatus, type StaffEmailUpdateInput } from "@/lib/email-data";
import { updateStaffEmail } from "@/lib/server/email-store";

export const dynamic = "force-dynamic";

function isEmailUpdatePayload(value: unknown): value is StaffEmailUpdateInput {
  if (!value || typeof value !== "object") {
    return false;
  }

  const candidate = value as Partial<StaffEmailUpdateInput>;
  const hasStatus = typeof candidate.status === "string";
  const hasDraft = typeof candidate.aiDraft === "string";

  if (!hasStatus && !hasDraft) {
    return false;
  }

  if (hasStatus && !isEmailStatus(candidate.status)) {
    return false;
  }

  if (hasDraft && candidate.aiDraft.trim().length === 0) {
    return false;
  }

  return true;
}

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const payload = await request.json().catch(() => null);

  if (!isEmailUpdatePayload(payload)) {
    return NextResponse.json(
      { error: "Invalid email update payload." },
      { status: 400 }
    );
  }

  const { id } = await context.params;
  const email = await updateStaffEmail(id, {
    ...(payload.status ? { status: payload.status } : {}),
    ...(payload.aiDraft ? { aiDraft: payload.aiDraft.trim() } : {}),
  });

  if (!email) {
    return NextResponse.json({ error: "Email not found." }, { status: 404 });
  }

  return NextResponse.json({ email });
}
