// Turns a CSV export of the Google Form registration responses (google-form/create-registration-form.gs)
// into event registrations shaped like the ones the website's own sign-up form creates. Pure, with
// no database access, so scripts/import-form-registrations.ts can preview and then write the rows.

export type FormRole = "attendee" | "volunteer" | "vendor";

export interface FormRegistration {
  row: number; // spreadsheet row number, counting the header as row 1
  registeredAs: FormRole;
  fullName: string;
  email: string;
  phone: string | null;
  organization: string | null;
  metadata: Record<string, string>; // flat, because the admin lists each key and value as text
}

export interface SkippedRow {
  row: number;
  name: string;
  reason: string;
}

const COLUMNS = {
  fullName: "Full name",
  email: "Email address",
  phone: "Phone number (WhatsApp preferred)",
  organization: "Institution, organisation or workplace",
  role: "I am registering as",
  businessName: "Business or brand name",
  timestamp: "Timestamp",
} as const;

// Short, readable detail names for the form's longer questions. Anything not listed here is
// still kept, under a camelCase version of the question.
const DETAIL_KEYS: Record<string, string> = {
  "Gender": "gender",
  "Age group": "ageGroup",
  "How did you hear about this event?": "heardAboutUsFrom",
  "Consent": "consent",
  "Are you coming alone or with a group?": "comingWith",
  "If you are coming with others, how many people (including you)?": "groupSize",
  "Trivia team name (if you have one)": "triviaTeam",
  "Which activities are you most excited about?": "favouriteActivities",
  "M-Pesa transaction code (if you have already paid)": "mPesaCode",
  "Any accessibility needs, dietary needs or questions for us?": "needsOrQuestions",
  "Which roles would you like to take on?": "volunteerRoles",
  "Have you volunteered with Greenwave Society before?": "volunteeredBefore",
  "Can you arrive early to help with setup?": "canArriveEarly",
  "Would you also like to volunteer at our other upcoming events?": "otherEventsToVolunteer",
  "Relevant skills or experience": "skills",
  "Emergency contact (name and phone number)": "emergencyContact",
  "T-shirt size (for volunteer branding)": "tShirtSize",
  "Business category": "businessCategory",
  "What will you be selling or showcasing?": "products",
  "Instagram, TikTok or website link": "businessLink",
  "Do you need a power connection at your stall?": "needsPower",
  "Will you bring your own table and chairs?": "bringsOwnFurniture",
  "How many people will staff your stall?": "stallStaff",
  "Would you also like a stall at our other upcoming events?": "otherEventsForStall",
  "Anything else we should know?": "notes",
};

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Parses RFC 4180 CSV (as Google Sheets downloads it): quoted cells, doubled quotes, embedded newlines. */
export function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = "";
  let quoted = false;
  const input = text.replace(/^﻿/, "");
  for (let i = 0; i < input.length; i++) {
    const char = input[i];
    if (quoted) {
      if (char === '"' && input[i + 1] === '"') { cell += '"'; i++; }
      else if (char === '"') quoted = false;
      else cell += char;
    } else if (char === '"') quoted = true;
    else if (char === ",") { row.push(cell); cell = ""; }
    else if (char === "\n" || char === "\r") {
      if (char === "\r" && input[i + 1] === "\n") i++;
      row.push(cell); cell = "";
      rows.push(row); row = [];
    } else cell += char;
  }
  if (cell !== "" || row.length) { row.push(cell); rows.push(row); }
  return rows.filter(r => r.some(value => value.trim() !== ""));
}

function camelKey(question: string) {
  const words = question.replace(/\([^)]*\)/g, " ").match(/[A-Za-z0-9]+/g) ?? ["answer"];
  return words.slice(0, 8).map((word, i) => (i === 0 ? word.toLowerCase() : word[0].toUpperCase() + word.slice(1).toLowerCase())).join("");
}

function roleOf(value: string): FormRole {
  const role = value.trim().toLowerCase();
  return role === "volunteer" || role === "vendor" ? role : "attendee";
}

const ROLE_LABEL: Record<FormRole, string> = { attendee: "Attendee", volunteer: "Volunteer", vendor: "Vendor" };

export function mapFormResponses(csvText: string): { registrations: FormRegistration[]; skipped: SkippedRow[] } {
  const [header = [], ...rows] = parseCsv(csvText);
  const headers = header.map(h => h.trim());
  const index = (title: string) => headers.indexOf(title);
  const missing = [COLUMNS.fullName, COLUMNS.email].filter(title => index(title) === -1);
  if (missing.length) throw new Error(`The CSV is missing the column(s): ${missing.join(", ")}. Download the form's responses sheet as CSV and try again.`);

  const handled = new Set<number>([COLUMNS.fullName, COLUMNS.email, COLUMNS.phone, COLUMNS.organization, COLUMNS.role, COLUMNS.businessName, COLUMNS.timestamp].map(index).filter(i => i >= 0));
  const registrations: FormRegistration[] = [];
  const skipped: SkippedRow[] = [];
  const seen = new Map<string, number>();

  rows.forEach((cells, i) => {
    const row = i + 2;
    const get = (title: string) => (index(title) >= 0 ? (cells[index(title)] ?? "").trim() : "");
    const fullName = get(COLUMNS.fullName).replace(/\s+/g, " ");
    const email = get(COLUMNS.email).toLowerCase();
    if (!fullName) return void skipped.push({ row, name: "", reason: "missing full name" });
    if (!EMAIL.test(email)) return void skipped.push({ row, name: fullName, reason: "invalid email address" });
    if (seen.has(email)) return void skipped.push({ row, name: fullName, reason: `email already appears in row ${seen.get(email)}` });
    seen.set(email, row);

    const registeredAs = roleOf(get(COLUMNS.role));
    const businessName = get(COLUMNS.businessName);
    const metadata: Record<string, string> = { source: "Google Form", registeredAs: ROLE_LABEL[registeredAs] };
    if (get(COLUMNS.timestamp)) metadata.submittedAt = get(COLUMNS.timestamp);
    if (registeredAs === "vendor" && businessName) metadata.vendorName = businessName;
    headers.forEach((question, column) => {
      const answer = (cells[column] ?? "").trim();
      if (!answer || handled.has(column) || !question) return;
      metadata[DETAIL_KEYS[question] ?? camelKey(question)] = answer.slice(0, 2000);
    });

    registrations.push({
      row,
      registeredAs,
      fullName: fullName.slice(0, 180),
      email,
      phone: get(COLUMNS.phone).slice(0, 40) || null,
      organization: (registeredAs === "vendor" ? businessName || get(COLUMNS.organization) : get(COLUMNS.organization)).slice(0, 180) || null,
      metadata,
    });
  });
  return { registrations, skipped };
}
