import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const { send } = vi.hoisted(() => ({ send: vi.fn() }));
vi.mock("resend", () => ({ Resend: class { emails = { send }; } }));
vi.mock("./logger", () => ({ logger: { info: vi.fn(), error: vi.fn() } }));
import { sendPasswordResetEmail } from "./email";

describe("password reset email delivery", () => {
  beforeEach(() => { send.mockReset(); vi.stubEnv("RESEND_API_KEY", "test-key"); });
  afterEach(() => vi.unstubAllEnvs());
  it("reports provider rejection", async () => {
    send.mockResolvedValue({ data: null, error: { message: "Rejected" } });
    expect(await sendPasswordResetEmail("admin@example.com", "https://example.com/reset/token")).toBe(false);
  });
  it("requires a provider message ID", async () => {
    send.mockResolvedValue({ data: null, error: null });
    expect(await sendPasswordResetEmail("admin@example.com", "https://example.com/reset/token")).toBe(false);
  });
  it("reports accepted email", async () => {
    send.mockResolvedValue({ data: { id: "message-id" }, error: null });
    expect(await sendPasswordResetEmail("admin@example.com", "https://example.com/reset/token")).toBe(true);
  });
  it("handles network failures", async () => {
    send.mockRejectedValue(new Error("Network failure"));
    expect(await sendPasswordResetEmail("admin@example.com", "https://example.com/reset/token")).toBe(false);
  });
  it("fails when email is not configured", async () => {
    vi.stubEnv("RESEND_API_KEY", "");
    expect(await sendPasswordResetEmail("admin@example.com", "https://example.com/reset/token")).toBe(false);
    expect(send).not.toHaveBeenCalled();
  });
});
