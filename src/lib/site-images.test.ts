import { describe, expect, it } from "vitest";
import { siteImageRoute } from "./site-images";

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
