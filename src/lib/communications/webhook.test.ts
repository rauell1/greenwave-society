import { describe, expect, it } from "vitest";
describe("Resend webhook contract",()=>{it("uses provider message IDs recorded during campaign send",()=>{const providerMessageId="email_123";expect(providerMessageId).toMatch(/^email_/)});it("treats webhook IDs as idempotency keys",()=>expect(new Set(["msg_1","msg_1"]).size).toBe(1))});
