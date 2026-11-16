// Round trip: runs google-form/create-registration-form.gs against a strict stand-in for Google's
// FormApp (only the methods the script is meant to use exist, so a misspelt call throws), then
// builds the CSV Google Sheets would export from that form and imports it with mapFormResponses.
import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { COLUMNS, DETAIL_KEYS, mapFormResponses } from "./form-import";

type Item = { type: string; title?: string; help?: string; required?: boolean; choices?: string[]; other?: boolean; goTo?: unknown; navigation?: Record<string, Item>; validation?: Validation };
type Validation = { kind: string; pattern?: string; count?: number };

function buildForm() {
  const items: Item[] = [];
  const logs: string[] = [];
  const formSettings: Record<string, unknown> = {};

  function item(type: string) {
    const record: Item = { type };
    items.push(record);
    const api: Record<string, (...args: never[]) => unknown> = {
      setTitle: (title: string) => ((record.title = title), api),
      setHelpText: (help: string) => ((record.help = help), api),
    };
    if (type !== "section" && type !== "page") api.setRequired = (required: boolean) => ((record.required = required), api);
    if (type === "text" || type === "paragraph" || type === "checkbox") api.setValidation = (validation: Validation) => ((record.validation = validation), api);
    if (type === "choice" || type === "checkbox") {
      api.setChoiceValues = (values: string[]) => ((record.choices = values), api);
      api.showOtherOption = (other: boolean) => ((record.other = other), api);
    }
    if (type === "choice") {
      api.createChoice = (value: string, page: { record: Item }) => ({ value, page: page.record });
      api.setChoices = (choices: { value: string; page: Item }[]) => {
        record.choices = choices.map(c => c.value);
        record.navigation = Object.fromEntries(choices.map(c => [c.value, c.page]));
        return api;
      };
      api.createResponse = (value: string) => {
        if (!record.choices?.includes(value)) throw new Error(`"${value}" is not a choice`);
        return { title: record.title, value };
      };
    }
    if (type === "page") api.setGoToPage = (target: unknown) => ((record.goTo = target), api);
    Object.defineProperty(api, "record", { value: record });
    return api;
  }

  function validationBuilder(kindPrefix: string) {
    const v: Validation = { kind: kindPrefix };
    const builder = {
      setHelpText: () => builder,
      requireTextIsEmail: () => ((v.kind = "email"), builder),
      requireTextMatchesPattern: (pattern: string) => ((v.kind = "pattern"), (v.pattern = pattern), builder),
      requireWholeNumber: () => ((v.kind = "number"), builder),
      requireSelectExactly: (count: number) => ((v.kind = "exactly"), (v.count = count), builder),
      build: () => v,
    };
    return builder;
  }

  const form: Record<string, (...args: never[]) => unknown> = {};
  for (const setting of ["setTitle", "setDescription", "setConfirmationMessage", "setProgressBar", "setShowLinkToRespondAgain", "setAcceptingResponses", "setPublished"]) {
    form[setting] = (value: never) => ((formSettings[setting] = value), form);
  }
  Object.assign(form, {
    addSectionHeaderItem: () => item("section"),
    addTextItem: () => item("text"),
    addParagraphTextItem: () => item("paragraph"),
    addMultipleChoiceItem: () => item("choice"),
    addCheckboxItem: () => item("checkbox"),
    addPageBreakItem: () => item("page"),
    setDestination: (type: string, id: string) => ((formSettings.destination = [type, id]), form),
    getPublishedUrl: () => "https://docs.google.com/forms/d/e/FORM/viewform",
    getEditUrl: () => "https://docs.google.com/forms/d/FORM/edit",
    shortenFormUrl: (url: string) => url,
    createResponse: () => {
      const answers: { title: string; value: string }[] = [];
      const response = {
        withItemResponse: (answer: { title: string; value: string }) => (answers.push(answer), response),
        toPrefilledUrl: () => `https://docs.google.com/forms/d/e/FORM/viewform?prefill=${encodeURIComponent(answers.map(a => a.value).join(","))}`,
      };
      return response;
    },
  });

  const FormApp = {
    create: (title: string) => ((formSettings.created = title), form),
    createTextValidation: () => validationBuilder("text"),
    createCheckboxValidation: () => validationBuilder("checkbox"),
    PageNavigationType: { SUBMIT: "SUBMIT" },
    DestinationType: { SPREADSHEET: "SPREADSHEET" },
  };
  const SpreadsheetApp = { create: (name: string) => ({ getId: () => "SHEET", getUrl: () => `https://docs.google.com/spreadsheets/d/SHEET (${name})` }) };
  const Logger = { log: (line: string) => logs.push(line) };

  const source = fs.readFileSync(path.join(process.cwd(), "google-form/create-registration-form.gs"), "utf8");
  new Function("FormApp", "SpreadsheetApp", "Logger", `${source}\ncreateGreenwaveRegistrationForm();`)(FormApp, SpreadsheetApp, Logger);
  return { items, logs, formSettings };
}

const { items, logs, formSettings } = buildForm();
const questions = items.filter(i => i.type !== "section" && i.type !== "page");
const pages = items.filter(i => i.type === "page");
const byTitle = (title: string) => items.find(i => i.title === title)!;

/** The questions on a page: everything after its page break up to the next one (page 1 when page is null). */
function questionsOn(page: Item | null) {
  const start = page ? items.indexOf(page) + 1 : 0;
  const end = items.findIndex((i, n) => n >= start && i.type === "page");
  return items.slice(start, end === -1 ? undefined : end).filter(i => i.type !== "section" && i.type !== "page");
}

function sampleAnswer(q: Item, role: string) {
  if (q.title === COLUMNS.role) return role;
  if (q.title === COLUMNS.email) return `${role.toLowerCase()}@example.com`;
  if (q.title === COLUMNS.phone) return "0712 345 678";
  if (q.title === COLUMNS.fullName) return `Test ${role}`;
  if (q.validation?.kind === "number") return "2";
  if (q.validation?.kind === "exactly") return q.choices!.join(", ");
  if (q.type === "checkbox") return q.choices!.slice(0, 2).join(", ");
  if (q.choices) return q.choices[0];
  return `${role} answer`;
}

describe("Google Form script", () => {
  it("runs, publishes, saves responses to a sheet and logs every link", () => {
    expect(formSettings.setPublished).toBe(true);
    expect(formSettings.setAcceptingResponses).toBe(true);
    expect(formSettings.destination).toEqual(["SPREADSHEET", "SHEET"]);
    for (const label of ["GENERAL REGISTRATION LINK", "ATTENDEE LINK", "VOLUNTEER LINK", "VENDOR LINK", "EDIT THE FORM", "RESPONSES SPREADSHEET"]) {
      expect(logs.some(line => line.startsWith(label))).toBe(true);
    }
    expect(logs.find(line => line.startsWith("VOLUNTEER LINK"))).toContain("prefill=Volunteer");
    expect(logs.find(line => line.startsWith("VENDOR LINK"))).toContain("prefill=Vendor");
  });

  it("sends each role to its own page and ends the form after it", () => {
    const role = byTitle(COLUMNS.role);
    const [attendee, volunteer, vendor] = pages;
    expect(role.navigation).toEqual({ Attendee: attendee, Volunteer: volunteer, Vendor: vendor });
    // A page break's goTo applies to the page before it: attendees and volunteers submit, vendors are last.
    expect(volunteer.goTo).toBe("SUBMIT");
    expect(vendor.goTo).toBe("SUBMIT");
    expect(questionsOn(vendor).map(q => q.title)).toContain(COLUMNS.businessName);
  });

  it("asks every question the importer needs, and the importer knows every question", () => {
    const titles = questions.map(q => q.title);
    for (const column of [COLUMNS.fullName, COLUMNS.email, COLUMNS.phone, COLUMNS.organization, COLUMNS.role, COLUMNS.businessName]) expect(titles).toContain(column);
    const known = new Set<string>([...Object.values(COLUMNS), ...Object.keys(DETAIL_KEYS)]);
    expect(titles.filter(t => !known.has(t!))).toEqual([]);
    expect(new Set(titles).size).toBe(titles.length); // Sheets would rename duplicate column headers
  });

  it("accepts the phone formats the website accepts", () => {
    const pattern = new RegExp(byTitle(COLUMNS.phone).validation!.pattern!);
    for (const phone of ["0712 345 678", "+254 712 345 678", "0712345678", "+254712345678"]) expect(pattern.test(phone)).toBe(true);
    expect(pattern.test("call me")).toBe(false);
  });
});

describe("responses sheet to database import", () => {
  // Google Sheets puts a Timestamp column first, then one column per question in form order.
  const headers = ["Timestamp", ...questions.map(q => q.title!)];
  const rowFor = (role: string, page: Item) => {
    const answered = new Set([...questionsOn(null), ...questionsOn(page)]);
    return ["16/11/2026 10:00:00", ...questions.map(q => (answered.has(q) ? sampleAnswer(q, role) : ""))];
  };
  const toCsv = (rows: string[][]) => rows.map(r => r.map(c => `"${c.replace(/"/g, '""')}"`).join(",")).join("\r\n");
  const [attendeePage, volunteerPage, vendorPage] = pages;
  const { registrations, skipped } = mapFormResponses(toCsv([headers, rowFor("Attendee", attendeePage), rowFor("Volunteer", volunteerPage), rowFor("Vendor", vendorPage)]));

  it("imports one person per role with nothing skipped", () => {
    expect(skipped).toEqual([]);
    expect(registrations.map(r => [r.registeredAs, r.fullName, r.email])).toEqual([
      ["attendee", "Test Attendee", "attendee@example.com"],
      ["volunteer", "Test Volunteer", "volunteer@example.com"],
      ["vendor", "Test Vendor", "vendor@example.com"],
    ]);
  });

  it("tags volunteers so they are not counted in places, and gives vendors their business name", () => {
    const [attendee, volunteer, vendor] = registrations;
    expect(volunteer.metadata.registeredAs).toBe("Volunteer");
    expect(volunteer.metadata.volunteerRoles).toBeTruthy();
    expect(vendor.metadata.vendorName).toBe("Vendor answer");
    expect(vendor.organization).toBe("Vendor answer");
    expect(attendee.metadata).not.toHaveProperty("vendorName");
  });

  it("stores every answer under a readable name, never a fallback key", () => {
    const expectedKeys = new Set(["source", "registeredAs", "submittedAt", "vendorName", ...Object.values(DETAIL_KEYS)]);
    for (const r of registrations) expect(Object.keys(r.metadata).filter(k => !expectedKeys.has(k))).toEqual([]);
  });
});
