import { describe, expect, it } from "vitest";
import { canTransitionEvent, eventInputSchema, registrationStatus } from "./validation";
describe("event validation", () => {
  it("requires an end after the start", () => expect(eventInputSchema.safeParse({ slug: "event", title: "Event", description: "Details", startsAt: "2026-09-02", endsAt: "2026-09-01" }).success).toBe(false));
  it("waitlists after capacity is reached", () => expect(registrationStatus(25, 25)).toBe("waitlisted"));
  it("does not reopen terminal event states", () => { expect(canTransitionEvent("draft", "published")).toBe(true); expect(canTransitionEvent("completed", "published")).toBe(false); });
  it("rejects inverted registration windows", () => expect(eventInputSchema.safeParse({ slug: "event", title: "Event", description: "Details", startsAt: "2026-09-02", endsAt: "2026-09-03", registrationOpensAt: "2026-09-02", registrationClosesAt: "2026-09-01" }).success).toBe(false));
});
