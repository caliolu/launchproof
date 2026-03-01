import { describe, it, expect } from "vitest";
import { slugify, generateUniqueSlug } from "@/lib/utils/slugify";

describe("slugify", () => {
  it("converts to lowercase", () => {
    expect(slugify("Hello World")).toBe("hello-world");
  });

  it("replaces spaces with hyphens", () => {
    expect(slugify("my startup idea")).toBe("my-startup-idea");
  });

  it("removes special characters", () => {
    expect(slugify("Hello! @World #2024")).toBe("hello-world-2024");
  });

  it("trims leading/trailing hyphens", () => {
    expect(slugify("--hello--")).toBe("hello");
  });

  it("collapses multiple spaces/underscores into single hyphen", () => {
    expect(slugify("hello   world__test")).toBe("hello-world-test");
  });

  it("truncates to 60 characters", () => {
    const longText = "a".repeat(100);
    expect(slugify(longText).length).toBeLessThanOrEqual(60);
  });

  it("handles empty string", () => {
    expect(slugify("")).toBe("");
  });

  it("handles strings with only special characters", () => {
    expect(slugify("!@#$%")).toBe("");
  });
});

describe("generateUniqueSlug", () => {
  it("starts with the slugified text", () => {
    const slug = generateUniqueSlug("My Project");
    expect(slug.startsWith("my-project-")).toBe(true);
  });

  it("appends a random suffix", () => {
    const slug = generateUniqueSlug("Test");
    // Format: slugified-text-random6chars
    const parts = slug.split("-");
    expect(parts.length).toBeGreaterThanOrEqual(2);
    expect(parts[parts.length - 1].length).toBe(6);
  });

  it("generates unique slugs on each call", () => {
    const slug1 = generateUniqueSlug("Test");
    const slug2 = generateUniqueSlug("Test");
    expect(slug1).not.toBe(slug2);
  });
});
