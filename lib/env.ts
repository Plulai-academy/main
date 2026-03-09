// lib/env.ts
// Runtime environment variable validation.
// Call requireEnv() at the top of any API route that needs a secret.
// Throws a clear error at startup rather than a cryptic failure mid-request.

export function requireEnv(...vars: string[]): Record<string, string> {
  const result: Record<string, string> = {}
  const missing: string[] = []
  for (const v of vars) {
    const val = process.env[v]
    if (!val || val.includes('your_') || val.includes('_here')) {
      missing.push(v)
    } else {
      result[v] = val
    }
  }
  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(', ')}. ` +
      `Add them to .env.local (dev) or Vercel environment variables (prod).`
    )
  }
  return result
}

// Timing-safe string comparison (prevents timing attacks on secret comparison)
export function timingSafeEqual(a: string, b: string): boolean {
  if (typeof crypto !== 'undefined' && crypto.subtle) {
    // Use subtle crypto if available
    const aBytes = new TextEncoder().encode(a)
    const bBytes = new TextEncoder().encode(b)
    if (aBytes.length !== bBytes.length) return false
    let diff = 0
    for (let i = 0; i < aBytes.length; i++) {
      diff |= aBytes[i] ^ bBytes[i]
    }
    return diff === 0
  }
  // Fallback constant-time comparison
  if (a.length !== b.length) return false
  let diff = 0
  for (let i = 0; i < a.length; i++) {
    diff |= a.charCodeAt(i) ^ b.charCodeAt(i)
  }
  return diff === 0
}

// Verify cron authorization header using timing-safe comparison
export function verifyCronAuth(authHeader: string | null): boolean {
  const secret = process.env.CRON_SECRET
  if (!secret) return false
  if (!authHeader) return false
  return timingSafeEqual(authHeader, `Bearer ${secret}`)
}
