import { describe, expect, it } from "vitest";
import { siteImageRoute, storedImageRequest } from "./site-images";

const route = (path: string) => siteImageRoute(new URL(path, "https://greenwavesociety.org"));

describe("siteImageRoute", () => {
  it("maps plain image paths onto the media-files route", () => {
    expect(route("/images/g-12.jpg")).toBe("/media-files/images/g-12.jpg");
    expect(route("/images/events/a%20b.JPG")).toBe("/media-files/images/events/a%20b.JPG");
  });

  it("maps next/image requests for site photos", () => {
    expect(route("/_next/image?url=%2Fimages%2F20240706_IMG%202139.JPG&w=3840&q=75"))
      .toBe("/media-files/images/20240706_IMG%202139.JPG");
  });

  it("maps next/image requests for absolute site and cdn photo URLs", () => {
    expect(route("/_next/image?url=https%3A%2F%2Fcdn.greenwavesociety.org%2Fimages%2Fevents%2Fgraduation-cohort-1%2Fweb%2Fg_001.webp&w=640&q=75"))
      .toBe("/media-files/images/events/graduation-cohort-1/web/g_001.webp");
    expect(route("/_next/image?url=https%3A%2F%2Fgreenwavesociety.org%2Fimages%2Fa%2520b.jpg&w=640&q=75"))
      .toBe("/media-files/images/a%20b.jpg");
    expect(route("/_next/image?url=http%3A%2F%2Fcdn.greenwavesociety.org%2Fimages%2Fa.jpg&w=640&q=75")).toBeNull();
    expect(route("/_next/image?url=https%3A%2F%2Fevil.example%2Fimages%2Fa.jpg&w=640&q=75")).toBeNull();
  });

  it("leaves other requests alone", () => {
    expect(route("/")).toBeNull();
    expect(route("/media-files/media/x.png")).toBeNull();
    expect(route("/_next/image?url=https%3A%2F%2Fimages.unsplash.com%2Fx&w=64&q=75")).toBeNull();
    expect(route("/_next/image?url=%2Flogo.png&w=64&q=75")).toBeNull();
    expect(route("/imagesX/a.jpg")).toBeNull();
  });

  it("refuses traversal and malformed paths", () => {
    expect(route("/images/../media/secret.png")).toBeNull();
    expect(route("/images/%2e%2e/media/secret.png")).toBeNull();
    expect(route("/_next/image?url=%2Fimages%2F..%2Fmedia%2Fx.png&w=64&q=75")).toBeNull();
    expect(route("/images//a.jpg")).toBeNull();
    expect(route("/images/%E0%A4%A.jpg")).toBeNull();
  });
});

describe("storedImageRequest", () => {
  const request = (path: string) => storedImageRequest(new URL(path, "https://greenwavesociety.org"));

  it("returns the object key and the requested size", () => {
    expect(request("/_next/image?url=%2Fimages%2Fevents%2Fa%20b.jpg&w=640&q=80"))
      .toEqual({ key: "images/events/a b.jpg", width: 640, quality: 80 });
    expect(request("/images/g-12.jpg")).toEqual({ key: "images/g-12.jpg", width: null, quality: 75 });
  });

  it("ignores sizes next/image would never ask for", () => {
    expect(request("/_next/image?url=%2Fimages%2Fa.jpg&w=99999&q=500"))
      .toEqual({ key: "images/a.jpg", width: null, quality: 75 });
  });

  it("leaves everything else to Next.js", () => {
    expect(request("/about")).toBeNull();
    expect(request("/images/../media/x.png")).toBeNull();
  });
});
