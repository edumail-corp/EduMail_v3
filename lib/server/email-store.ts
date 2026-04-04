import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import {
  filterEmails,
  getInitialStaffEmails,
  type EmailFilter,
  type StaffEmail,
  type StaffEmailUpdateInput,
} from "@/lib/email-data";

const emailStorePath = path.join(process.cwd(), "data", "staff-emails.json");

async function writeStaffEmails(emails: StaffEmail[]) {
  await writeFile(emailStorePath, `${JSON.stringify(emails, null, 2)}\n`, "utf8");
}

async function ensureEmailStore() {
  await mkdir(path.dirname(emailStorePath), { recursive: true });

  try {
    await readFile(emailStorePath, "utf8");
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== "ENOENT") {
      throw error;
    }

    await writeStaffEmails(getInitialStaffEmails());
  }
}

async function readStaffEmails() {
  await ensureEmailStore();
  const fileContents = await readFile(emailStorePath, "utf8");
  return JSON.parse(fileContents) as StaffEmail[];
}

export async function listStaffEmails(filter: EmailFilter = "All") {
  const emails = await readStaffEmails();
  return filterEmails(emails, filter);
}

export async function updateStaffEmail(
  id: string,
  updates: StaffEmailUpdateInput
) {
  const emails = await readStaffEmails();
  const emailIndex = emails.findIndex((email) => email.id === id);

  if (emailIndex === -1) {
    return null;
  }

  const nextEmail: StaffEmail = {
    ...emails[emailIndex],
    ...updates,
  };

  const nextEmails = [...emails];
  nextEmails[emailIndex] = nextEmail;

  await writeStaffEmails(nextEmails);

  return nextEmail;
}
