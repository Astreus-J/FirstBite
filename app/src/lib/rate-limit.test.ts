import { test } from "node:test";
import assert from "node:assert/strict";
import { getClientIp } from "./rate-limit.ts";

// Re-implemented here (rather than importing biteRateLimiter/ipRateLimiter
// directly) so each test gets a fresh limiter instance instead of sharing
// the module-level singletons' state across tests.
async function freshLimiter() {
  const mod = await import(`./rate-limit.ts?fresh=${Math.random()}`);
  return mod;
}

test("allows requests under the limit", async () => {
  const { ipRateLimiter } = await freshLimiter();
  for (let i = 0; i < 30; i++) {
    assert.equal(ipRateLimiter.check("1.2.3.4"), false, `request ${i} should not be limited`);
  }
});

test("blocks requests once the limit is exceeded", async () => {
  const { biteRateLimiter } = await freshLimiter();
  for (let i = 0; i < 10; i++) {
    assert.equal(biteRateLimiter.check("bite-A"), false);
  }
  assert.equal(biteRateLimiter.check("bite-A"), true, "the 11th request within the window should be blocked");
});

test("limits are independent per key", async () => {
  const { biteRateLimiter } = await freshLimiter();
  for (let i = 0; i < 10; i++) biteRateLimiter.check("bite-B");
  assert.equal(biteRateLimiter.check("bite-B"), true, "bite-B should now be limited");
  assert.equal(biteRateLimiter.check("bite-C"), false, "a different key must not be affected");
});

test("bounds total tracked keys instead of growing without limit (M2 fix)", async () => {
  const { ipRateLimiter } = await freshLimiter();
  // Access the private map size via a cast — this test exists specifically
  // to prove the fix for the unbounded-Map DoS found in the independent
  // security review (M6.2, M2), so it needs to see the actual size.
  for (let i = 0; i < 6000; i++) {
    ipRateLimiter.check(`attacker-key-${i}`);
  }
  const size = (ipRateLimiter as unknown as { hits: Map<string, number[]> }).hits.size;
  assert.ok(size <= 5000, `expected at most 5000 tracked keys, got ${size}`);
});

test("getClientIp reads the first entry of x-forwarded-for", () => {
  const req = new Request("http://localhost/api/claim", {
    headers: { "x-forwarded-for": "9.9.9.9, 10.0.0.1" },
  });
  assert.equal(getClientIp(req), "9.9.9.9");
});

test("getClientIp falls back to x-real-ip, then 'unknown'", () => {
  const withRealIp = new Request("http://localhost/api/claim", {
    headers: { "x-real-ip": "8.8.8.8" },
  });
  assert.equal(getClientIp(withRealIp), "8.8.8.8");

  const withNothing = new Request("http://localhost/api/claim");
  assert.equal(getClientIp(withNothing), "unknown");
});
