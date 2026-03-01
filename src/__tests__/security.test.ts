import { describe, it, expect } from "vitest";
import { slugify } from "@/lib/utils/slugify";
import { rateLimit } from "@/lib/utils/rate-limit";

describe("Security: Input sanitization", () => {
  describe("slugify XSS prevention", () => {
    it("strips HTML special characters (tags become harmless)", () => {
      const result = slugify('<script>alert("xss")</script>');
      expect(result).not.toContain("<");
      expect(result).not.toContain(">");
      expect(result).not.toContain('"');
      expect(result).not.toContain("(");
      expect(result).not.toContain(")");
      // Word "script" remains but is harmless in a URL slug context
      expect(result).toBe("scriptalertxssscript");
    });

    it("strips javascript: protocol", () => {
      const result = slugify("javascript:alert(1)");
      expect(result).not.toContain("javascript:");
    });

    it("strips event handlers", () => {
      const result = slugify('onload=alert("xss")');
      expect(result).toBe("onloadalertxss");
      expect(result).not.toContain("=");
    });

    it("handles unicode injection attempts", () => {
      const result = slugify("test\u0000null\u200Bbyte");
      expect(result).not.toContain("\u0000");
      expect(result).not.toContain("\u200B");
    });
  });

  describe("Email validation regex", () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    it("accepts valid emails", () => {
      expect(emailRegex.test("user@example.com")).toBe(true);
      expect(emailRegex.test("user+tag@domain.co")).toBe(true);
      expect(emailRegex.test("u@d.io")).toBe(true);
    });

    it("rejects invalid emails", () => {
      expect(emailRegex.test("")).toBe(false);
      expect(emailRegex.test("no-at-sign")).toBe(false);
      expect(emailRegex.test("@no-local.com")).toBe(false);
      expect(emailRegex.test("spaces in@email.com")).toBe(false);
      expect(emailRegex.test("double@@sign.com")).toBe(false);
    });
  });

  describe("Rate limiting", () => {
    it("prevents rapid-fire requests", () => {
      const key = `security-test-${Date.now()}`;
      const results = [];
      for (let i = 0; i < 15; i++) {
        results.push(rateLimit(key, 10, 60000));
      }
      const successful = results.filter((r) => r.success).length;
      const blocked = results.filter((r) => !r.success).length;
      expect(successful).toBe(10);
      expect(blocked).toBe(5);
    });

    it("isolates rate limits per key (per-IP simulation)", () => {
      const key1 = `ip-1-${Date.now()}`;
      const key2 = `ip-2-${Date.now()}`;

      // Exhaust key1
      for (let i = 0; i < 5; i++) rateLimit(key1, 5, 60000);
      const blocked = rateLimit(key1, 5, 60000);
      expect(blocked.success).toBe(false);

      // key2 should still work
      const allowed = rateLimit(key2, 5, 60000);
      expect(allowed.success).toBe(true);
    });
  });
});

describe("Security: SQL injection prevention", () => {
  it("slugify strips SQL special characters", () => {
    const sqli = slugify("'; DROP TABLE projects; --");
    expect(sqli).not.toContain("'");
    expect(sqli).not.toContain(";");
    expect(sqli).not.toContain("--");
  });

  it("slugify handles UNION injection attempt", () => {
    const result = slugify("1 UNION SELECT * FROM profiles");
    expect(result).toBe("1-union-select-from-profiles");
    // Supabase uses parameterized queries, so this slug is safe
  });
});

describe("Security: Error information leakage", () => {
  it("errorResponse does not leak stack traces for unknown errors", async () => {
    const { errorResponse } = await import("@/lib/utils/errors");
    const res = errorResponse(new Error("Database connection failed: postgres://user:password@host"));
    const body = await res.json();
    expect(body.error).toBe("Internal server error");
    expect(body).not.toHaveProperty("stack");
    expect(JSON.stringify(body)).not.toContain("postgres://");
  });
});
