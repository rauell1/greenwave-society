import { describe, expect, it } from "vitest";
import { canTransitionMember, csvCell, memberNoteSchema, memberStatusSchema } from "./validation";

describe("member management validation", () => {
  it("accepts supported lifecycle states", () => expect(memberStatusSchema.parse({ status: "suspended", reason: "Policy review" }).status).toBe("suspended"));
  it("rejects empty internal notes", () => expect(memberNoteSchema.safeParse({ body: "  " }).success).toBe(false));
  it("neutralizes spreadsheet formulas", () => expect(csvCell("=IMPORTXML('x')")).toBe('"\'=IMPORTXML(\'x\')"'));
  it("neutralizes formulas hidden behind control characters", () => expect(csvCell("\t=1+1")).toBe('"\'\t=1+1"'));
  it("enforces explicit lifecycle transitions", () => { expect(canTransitionMember("approved", "suspended")).toBe(true); expect(canTransitionMember("rejected", "approved")).toBe(false); });
});
