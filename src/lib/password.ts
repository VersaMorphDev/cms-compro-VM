import crypto from "node:crypto";

const SCRYPT_PARAMS = { N: 16384, r: 8, p: 1 } as const;
const KEY_LENGTH = 64;

/**
 * Hashes a plaintext password using scrypt with a 16-byte random salt.
 * Format: scrypt$<saltHex>$<derivedHex>
 */
export function hashPassword(plain: string): string {
  const salt = crypto.randomBytes(16).toString("hex");
  const derived = crypto.scryptSync(plain, salt, KEY_LENGTH, SCRYPT_PARAMS);
  return `scrypt$${salt}$${derived.toString("hex")}`;
}

/**
 * Verifies a plaintext password against a stored scrypt hash in constant time.
 * Safely returns false for placeholder or malformed hashes.
 */
export function verifyPassword(plain: string, storedHash: string): boolean {
  if (!plain || !storedHash) return false;

  const parts = storedHash.split("$");
  if (parts.length !== 3 || parts[0] !== "scrypt") {
    return false;
  }

  const [, salt, hashHex] = parts;
  if (!salt || !hashHex || !/^[0-9a-f]+$/i.test(hashHex)) {
    return false;
  }

  try {
    const expected = Buffer.from(hashHex, "hex");
    if (expected.length !== KEY_LENGTH) {
      return false;
    }
    const derived = crypto.scryptSync(plain, salt, KEY_LENGTH, SCRYPT_PARAMS);
    return crypto.timingSafeEqual(expected, derived);
  } catch {
    return false;
  }
}
