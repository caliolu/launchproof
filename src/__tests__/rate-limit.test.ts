import { describe, it, expect } from "vitest";
import { rateLimit } from "@/lib/utils/rate-limit";

describe("rateLimit", () => {
  it("allows requests within limit", () => {
    const key = `test-${Date.now()}-allow`;
    const { success, remaining } = rateLimit(key, 5, 60000);
    expect(success).toBe(true);
    expect(remaining).toBe(4);
  });

  it("tracks remaining correctly", () => {
    const key = `test-${Date.now()}-track`;
    rateLimit(key, 3, 60000);
    const second = rateLimit(key, 3, 60000);
    expect(second.remaining).toBe(1);

    const third = rateLimit(key, 3, 60000);
    expect(third.remaining).toBe(0);
    expect(third.success).toBe(true);
  });

  it("blocks when limit exceeded", () => {
    const key = `test-${Date.now()}-block`;
    rateLimit(key, 2, 60000);
    rateLimit(key, 2, 60000);
    const { success, remaining } = rateLimit(key, 2, 60000);
    expect(success).toBe(false);
    expect(remaining).toBe(0);
  });

  it("resets after window expires", () => {
    const key = `test-${Date.now()}-reset`;
    // Use a very short window
    rateLimit(key, 1, 1);
    rateLimit(key, 1, 1);

    // Wait for window to expire
    const start = Date.now();
    while (Date.now() - start < 5) {
      // busy wait
    }

    const { success } = rateLimit(key, 1, 1);
    expect(success).toBe(true);
  });

  it("uses separate limits for different keys", () => {
    const key1 = `test-${Date.now()}-key1`;
    const key2 = `test-${Date.now()}-key2`;

    rateLimit(key1, 1, 60000);
    rateLimit(key1, 1, 60000); // blocked

    const result = rateLimit(key2, 1, 60000);
    expect(result.success).toBe(true); // different key, not blocked
  });
});
