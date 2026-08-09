import { describe, expect, it } from "vitest";
import { hashSessionToken } from "./session-token";

describe("session token hashing", () => {
  it("stores a deterministic one-way digest rather than the raw token", () => {
    const raw = "a".repeat(64);
    const digest = hashSessionToken(raw);
    expect(digest).toHaveLength(64);
    expect(digest).not.toBe(raw);
    expect(hashSessionToken(raw)).toBe(digest);
  });
});
