import { describe, expect, it } from "vitest";
import { sanitizeAuditState } from "./sanitize";

describe("sanitizeAuditState", () => {
  it("redacts secrets recursively", () => {
    expect(sanitizeAuditState({ email: "a@example.com", password: "nope", nested: { resetToken: "nope" } })).toEqual({
      email: "a@example.com", password: "[REDACTED]", nested: { resetToken: "[REDACTED]" },
    });
  });
});
