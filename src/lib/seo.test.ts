import { expect, it } from "vitest";
import { serializeJsonLd } from "./seo";
it("keeps user content inside the JSON-LD script while preserving its value", () => {
  const value = { title: "</script><script>alert(1)</script>" };
  expect(serializeJsonLd(value)).not.toContain("<");
  expect(JSON.parse(serializeJsonLd(value))).toEqual(value);
});
