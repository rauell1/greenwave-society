import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

const mocks = vi.hoisted(() => ({ save: vi.fn() }));
vi.mock("@/lib/auth/route-authorization", () => ({ authorizeRoute: vi.fn(async () => ({ ok: true, admin: { id: "admin-1", email: "admin@example.com" } })) }));
vi.mock("@/lib/audit/audit-service", () => ({ AUDIT_ACTIONS: { CONTENT_UPDATED: "content.updated" }, logAuditEvent: vi.fn() }));
vi.mock("@/lib/cms/placements", () => ({
  DEFAULT_PLACEMENTS: { about: { src: "/images/a.jpg", alt: "About" }, teamMartinKyalo: { src: "", alt: "Martin" } },
  getAdminPlacements: vi.fn(),
  getAvailableCmsImages: vi.fn(),
  saveImagePlacements: mocks.save,
}));
import { PUT } from "./route";

const put = (placements: unknown) =>
  PUT(new NextRequest("http://localhost/api/admin/placements", { method: "PUT", body: JSON.stringify({ placements }) }));

beforeEach(() => { vi.clearAllMocks(); mocks.save.mockResolvedValue({ id: "entry-1" }); });

describe("PUT /api/admin/placements", () => {
  it("saves a newly picked Activities photo that has no description yet", async () => {
    const response = await put({ "activity:ngong-hills-conservation-trek-youth-hike": { src: "/images/g-12.jpg" } });
    expect(response.status).toBe(200);
    expect(mocks.save).toHaveBeenCalledWith({ "activity:ngong-hills-conservation-trek-youth-hike": { src: "/images/g-12.jpg", alt: "" } }, "admin-1");
  });

  it("still refuses photos from hosts the site cannot load, and empty photos outside team slots", async () => {
    const response = await put({ about: { src: "https://example.com/x.jpg", alt: "x" }, "activity:a": { src: "", alt: "" }, teamMartinKyalo: { src: "", alt: "" } });
    expect(response.status).toBe(400);
    const { error } = await response.json();
    expect(error).toContain("about");
    expect(error).toContain("activity:a");
    expect(error).not.toContain("teamMartinKyalo");
    expect(mocks.save).not.toHaveBeenCalled();
  });
});
