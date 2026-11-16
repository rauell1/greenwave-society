import { describe, expect, it } from "vitest";
import { mapFormResponses, parseCsv } from "./form-import";

const HEADERS = [
  "Timestamp",
  "Full name",
  "Email address",
  "Phone number (WhatsApp preferred)",
  "Institution, organisation or workplace",
  "I am registering as",
  "Which roles would you like to take on?",
  "Business or brand name",
  "Business category",
  "M-Pesa transaction code (if you have already paid)",
];

function csv(rows: string[][]) {
  return [HEADERS, ...rows].map(row => row.map(cell => `"${cell.replace(/"/g, '""')}"`).join(",")).join("\r\n");
}

describe("parseCsv", () => {
  it("handles quoted commas, escaped quotes and newlines inside cells", () => {
    expect(parseCsv('a,b\r\n"x, y","say ""hi""\nthere"\n')).toEqual([["a", "b"], ["x, y", 'say "hi"\nthere']]);
  });

  it("ignores a byte order mark and blank lines", () => {
    expect(parseCsv("﻿a,b\n\n1,2\n")).toEqual([["a", "b"], ["1", "2"]]);
  });
});

describe("mapFormResponses", () => {
  it("maps an attendee like the website sign-up, keeping extra answers as flat details", () => {
    const { registrations, skipped } = mapFormResponses(csv([["16/11/2026 10:00:00", " Jane Doe ", "Jane@Example.com", "0712 345 678", "UoN", "Attendee", "", "", "", "QWE123"]]));
    expect(skipped).toEqual([]);
    expect(registrations).toEqual([{
      row: 2,
      registeredAs: "attendee",
      fullName: "Jane Doe",
      email: "jane@example.com",
      phone: "0712 345 678",
      organization: "UoN",
      metadata: { source: "Google Form", registeredAs: "Attendee", submittedAt: "16/11/2026 10:00:00", mPesaCode: "QWE123" },
    }]);
  });

  it("stores vendors with vendorName so the admin shows them as vendors", () => {
    const { registrations } = mapFormResponses(csv([["t", "Ann Seller", "ann@shop.co", "+254 711 000 000", "Ignored Uni", "Vendor", "", "Ann's Crafts", "Arts and crafts", ""]]));
    expect(registrations[0]).toMatchObject({ registeredAs: "vendor", organization: "Ann's Crafts", metadata: { vendorName: "Ann's Crafts", businessCategory: "Arts and crafts", registeredAs: "Vendor" } });
  });

  it("tags volunteers and keeps their roles", () => {
    const { registrations } = mapFormResponses(csv([["t", "Val Helper", "val@x.org", "0700000000", "", "Volunteer", "Ushering and guest welcome, Scorekeeping", "", "", ""]]));
    expect(registrations[0]).toMatchObject({ registeredAs: "volunteer", organization: null, metadata: { registeredAs: "Volunteer", volunteerRoles: "Ushering and guest welcome, Scorekeeping" } });
    expect(registrations[0].metadata).not.toHaveProperty("vendorName");
  });

  it("turns unknown questions into readable camelCase keys", () => {
    const text = [["Full name", "Email address", "I am registering as", "Favourite snack?"], ["Sam Lee", "sam@x.org", "Attendee", "Crisps"]].map(r => r.join(",")).join("\n");
    expect(mapFormResponses(text).registrations[0].metadata).toMatchObject({ favouriteSnack: "Crisps" });
  });

  it("skips rows with a bad email, a missing name or a repeated email, saying why", () => {
    const { registrations, skipped } = mapFormResponses(csv([
      ["t", "No Email", "not-an-email", "0700000000", "", "Attendee", "", "", "", ""],
      ["t", "", "blank@x.org", "0700000000", "", "Attendee", "", "", "", ""],
      ["t", "First Copy", "dup@x.org", "0700000000", "", "Attendee", "", "", "", ""],
      ["t", "Second Copy", "DUP@x.org", "0700000000", "", "Volunteer", "", "", "", ""],
    ]));
    expect(registrations.map(r => r.fullName)).toEqual(["First Copy"]);
    expect(skipped).toEqual([
      { row: 2, name: "No Email", reason: "invalid email address" },
      { row: 3, name: "", reason: "missing full name" },
      { row: 5, name: "Second Copy", reason: "email already appears in row 4" },
    ]);
  });

  it("refuses a file without the required columns", () => {
    expect(() => mapFormResponses("Name,Mail\nA,b@c.d")).toThrow(/Full name/);
  });
});
