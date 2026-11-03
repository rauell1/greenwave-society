import { describe, expect, it, vi, beforeEach } from "vitest";
import { POST } from "./route";
import { NextRequest } from "next/server";

const createMock = vi.fn();
const sendMock = vi.fn().mockResolvedValue({ data: { id: "msg_123" } });

vi.mock("@/lib/db", () => ({
  getDb: () => ({
    careerRole: {
      upsert: vi.fn().mockResolvedValue({ id: "role_1" }),
      findUnique: vi.fn().mockResolvedValue({ isOpen: true }),
      findMany: vi.fn().mockResolvedValue([]),
    },
    careerApplication: {
      create: createMock,
    },
  }),
}));

vi.mock("resend", () => ({
  Resend: class {
    emails = {
      send: sendMock,
    };
  },
}));

describe("Career Application API (/api/apply) - CFO End-to-End Registration", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.RESEND_API_KEY = "test_key";
  });

  it("successfully registers a CFO application end to end", async () => {
    createMock.mockResolvedValue({ id: "app_123" });

    const payload = {
      roleSlug: "chief-financial-officer",
      fullName: "Jane Mwangi",
      email: "jane.mwangi@example.com",
      phone: "+254712345678",
      location: "Nairobi, Kenya",
      availability: "10-15 hours per week, available for Thursday 8 PM meetings",
      portfolioUrl: "https://www.linkedin.com/in/jane-mwangi-cfo",
      motivation: "Passionate about steering fiscal sustainability for youth-led social enterprises in Kenya.",
      relevantExperience: "10 years as Senior Finance Director managing KES 200M+ budgets and statutory audits.",
      collaborationStyle: "Collaborative, transparent, and structured with clear data-driven communication.",
      roleResponse: "I would design a dual-engine financial model separating restricted donor grants from earned commercial income.",
      consent: true,
    };

    const req = new NextRequest("http://localhost:3000/api/apply", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const res = await POST(req);
    expect(res.status).toBe(200);

    const data = await res.json();
    expect(data.reference).toMatch(/^GWS-\d{8}-[A-Z0-9]{6}$/);

    expect(createMock).toHaveBeenCalledTimes(1);
    const savedData = createMock.mock.calls[0][0].data;
    expect(savedData.roleSlug).toBe("chief-financial-officer");
    expect(savedData.roleTitle).toBe("Chief Financial Officer (CFO)");
    expect(savedData.fullName).toBe("Jane Mwangi");
    expect(savedData.email).toBe("jane.mwangi@example.com");
    expect(savedData.portfolioUrl).toBe("https://www.linkedin.com/in/jane-mwangi-cfo");
    expect(savedData.reference).toBe(data.reference);

    // Verify confirmation and notification emails dispatched
    expect(sendMock).toHaveBeenCalledTimes(2);
    expect(sendMock).toHaveBeenCalledWith(
      expect.objectContaining({
        to: "jane.mwangi@example.com",
        subject: expect.stringContaining(data.reference),
      })
    );
  });

  it("successfully handles the 'cfo' alias shortcut", async () => {
    createMock.mockResolvedValue({ id: "app_124" });

    const payload = {
      roleSlug: "cfo",
      fullName: "Alex Mutua",
      email: "alex.mutua@example.com",
      phone: "+254722334455",
      location: "Nairobi, Kenya",
      availability: "Available for executive cadence and audit meetings",
      portfolioUrl: "https://linkedin.com/in/alex-mutua",
      motivation: "Dedicated to building resilient non-profit financial architecture.",
      relevantExperience: "Former CFO with non-profit audit experience in East Africa.",
      collaborationStyle: "Empathetic, clear, and proactive.",
      roleResponse: "Implementing automated monthly cashflow projections and internal expenditure verification.",
      consent: true,
    };

    const req = new NextRequest("http://localhost:3000/api/apply", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const res = await POST(req);
    expect(res.status).toBe(200);

    const data = await res.json();
    expect(data.reference).toBeTruthy();
    expect(createMock.mock.calls[0][0].data.roleSlug).toBe("chief-financial-officer");
  });

  it("requires a professional profile URL for the CFO role", async () => {
    const payload = {
      roleSlug: "chief-financial-officer",
      fullName: "No Profile Candidate",
      email: "noprofile@example.com",
      phone: "+254700000000",
      location: "Nairobi",
      availability: "Full time",
      portfolioUrl: "", // missing required portfolio
      motivation: "Motivation test",
      relevantExperience: "Experience test",
      collaborationStyle: "Style test",
      roleResponse: "Response test",
      consent: true,
    };

    const req = new NextRequest("http://localhost:3000/api/apply", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const res = await POST(req);
    expect(res.status).toBe(400);

    const data = await res.json();
    expect(data.error).toContain("LinkedIn");
  });
});
