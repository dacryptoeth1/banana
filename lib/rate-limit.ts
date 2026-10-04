/*
 * Simple fixed-window limits, in memory. Each serverless instance keeps its own counts, so this is a
 * speed bump for a public demo, not a hard quota. The relayer's gas floor (lib/escrow-chain.ts) and
 * the per-order cap are the backstops.
 */
const windows = new Map<string, { start: number; count: number }>();

/** True if this hit is allowed. `key` identifies the bucket (e.g. "ip:1.2.3.4:min"). */
export function allow(key: string, limit: number, windowMs: number, now = Date.now()) {
  const w = windows.get(key);
  if (!w || now - w.start >= windowMs) {
    windows.set(key, { start: now, count: 1 });
    if (windows.size > 5000) for (const [k, v] of windows) if (now - v.start >= windowMs) windows.delete(k); // keep memory bounded
    return true;
  }
  if (w.count >= limit) return false;
  w.count++;
  return true;
}

export const clientIp = (req: Request) =>
  req.headers.get('x-real-ip') ?? req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown';
