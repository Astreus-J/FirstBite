// Minimal, in-memory, best-effort rate limiting for the MVP (docs/SECURITY.md
// documents this as an accepted limitation, not a solved problem: it resets
// on redeploy and doesn't share state across serverless instances). Its job
// is to blunt naive repeated requests, not to be a real defense against a
// determined, distributed attacker.
//
// Bounded to MAX_TRACKED_KEYS total keys (oldest-inserted evicted first) so
// an attacker who generates a fresh identifier per request (e.g. a random
// pubkey, since the per-Bite limiter's key is checked before the Bite is
// even confirmed to exist) can't grow this map without bound and exhaust
// process memory — found in the independent security review (M6.2, M2).
const MAX_TRACKED_KEYS = 5000;

class BoundedRateLimiter {
  private hits = new Map<string, number[]>();
  private windowMs: number;
  private max: number;

  constructor(windowMs: number, max: number) {
    this.windowMs = windowMs;
    this.max = max;
  }

  /** Returns true if `key` has exceeded the limit for this window. */
  check(key: string): boolean {
    const now = Date.now();
    const timestamps = (this.hits.get(key) ?? []).filter((t) => now - t < this.windowMs);
    timestamps.push(now);
    this.hits.set(key, timestamps);
    this.evictIfOverCapacity();
    return timestamps.length > this.max;
  }

  private evictIfOverCapacity() {
    const excess = this.hits.size - MAX_TRACKED_KEYS;
    if (excess <= 0) return;
    const keys = this.hits.keys();
    for (let i = 0; i < excess; i++) {
      const next = keys.next();
      if (next.done) break;
      this.hits.delete(next.value);
    }
  }
}

// Per-Bite: blunts repeated attempts against one specific Bite.
export const biteRateLimiter = new BoundedRateLimiter(60_000, 10);

// Per-IP: blunts one origin farming many self-funded Bites to drain the
// sponsor's fee budget across *different* Bites (docs/SECURITY.md T6/H1 from
// the independent review) — the per-Bite limiter alone doesn't catch this
// since each Bite only sees a handful of requests.
export const ipRateLimiter = new BoundedRateLimiter(60_000, 30);

export function getClientIp(request: Request): string {
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) return forwardedFor.split(",")[0].trim();
  return request.headers.get("x-real-ip") ?? "unknown";
}
