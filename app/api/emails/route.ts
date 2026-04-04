import { NextResponse } from "next/server";
import { isEmailFilter, type EmailFilter } from "@/lib/email-data";
import { listStaffEmails } from "@/lib/server/email-store";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const filterParam = searchParams.get("filter");

  if (filterParam !== null && !isEmailFilter(filterParam)) {
    return NextResponse.json(
      { error: "Invalid email filter." },
      { status: 400 }
    );
  }

  const filter: EmailFilter = filterParam ?? "All";
  const emails = await listStaffEmails(filter);

  return NextResponse.json({ emails });
}
