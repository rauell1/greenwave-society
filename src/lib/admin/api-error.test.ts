import { describe, expect, it } from "vitest";
import { readApiError } from "./api-error";

describe("readApiError", () => {
  it("uses the API error and field issues", async () => {
    const response = Response.json({ error: "Invalid event", issues: { formErrors: [], fieldErrors: { endsAt: ["End time must be after start time"] } } }, { status: 400 });
    expect(await readApiError(response, "Failed")).toBe("Invalid event (endsAt: End time must be after start time)");
  });
  it("explains non-JSON platform errors by status", async () => {
    expect(await readApiError(new Response("Request Entity Too Large", { status: 413 }), "Failed")).toBe("The file is too large to upload.");
    expect(await readApiError(new Response("<html>", { status: 502 }), "Failed")).toBe("Failed");
  });
});
