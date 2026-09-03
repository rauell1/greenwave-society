import { describe, expect, it } from "vitest";
import { EXECUTIVE_ROLE_NAMES, isExecutiveRoleName } from "./executive-roles";

describe("executive role catalogue", () => {
  it("includes the established and newly recruited executive positions", () => {
    expect(EXECUTIVE_ROLE_NAMES).toHaveLength(9);
    expect(EXECUTIVE_ROLE_NAMES).toContain("Chief Executive Officer (CEO)");
    expect(EXECUTIVE_ROLE_NAMES).toContain("External Communications Lead");
    expect(EXECUTIVE_ROLE_NAMES).toContain("Internal Communications Assistant");
    expect(EXECUTIVE_ROLE_NAMES).toContain("Partnerships Lead");
  });

  it("does not treat operational permission bundles as executive positions", () => {
    expect(isExecutiveRoleName("Head of Design")).toBe(true);
    expect(isExecutiveRoleName("Administrator")).toBe(false);
    expect(isExecutiveRoleName("Owner")).toBe(false);
  });
});
