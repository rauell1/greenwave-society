import { describe, expect, it } from "vitest";
import { parsePagination } from "./pagination";

describe("parsePagination", () => {
  it("uses safe defaults", () => expect(parsePagination({})).toEqual({ page: 1, pageSize: 20, skip: 0 }));
  it("caps page size and calculates offset", () => expect(parsePagination({ page: "3", pageSize: "500" })).toEqual({ page: 3, pageSize: 100, skip: 200 }));
});
