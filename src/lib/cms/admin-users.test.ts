import { describe, expect, it } from "vitest";
import { createAdminSchema, wouldRemoveFinalOwner } from "./admin-users";

describe("admin user management", () => {
  it("normalizes valid email addresses", () => expect(createAdminSchema.parse({ email: " OWNER@EXAMPLE.COM ", roleIds: ["role"] }).email).toBe("owner@example.com"));
  it("protects the final active owner", () => expect(wouldRemoveFinalOwner({ targetIsOwner: true, nextIsOwner: false, activeOwnerCount: 1, nextIsActive: true })).toBe(true));
  it("allows owner removal when another active owner exists", () => expect(wouldRemoveFinalOwner({ targetIsOwner: true, nextIsOwner: false, activeOwnerCount: 2, nextIsActive: true })).toBe(false));
});
