export const ADMIN_ROLES = [
  "SUPER_ADMIN",
  "CONTENT_EDITOR",
  "HR_RECRUITER",
  "SALES_BD",
] as const;

export type AdminRole = (typeof ADMIN_ROLES)[number];

export const SESSION_COOKIE_NAME = "vm_cms_session";
export const SESSION_TTL_SECONDS = 60 * 60 * 24 * 7; // 7 days

export interface SessionTokenPayload {
  userId: number;
  email: string;
  name: string;
  role: AdminRole;
  avatarInitials: string;
  exp: number;
}

const DEFAULT_DEV_SECRET = "versa-morph-cms-dev-session-secret-change-me";

function getSessionSecret(): string {
  return process.env.AUTH_SECRET?.trim() || DEFAULT_DEV_SECRET;
}

function bytesToBase64Url(bytes: Uint8Array): string {
  let binary = "";
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function base64UrlToBytes(input: string): Uint8Array | null {
  try {
    const padded =
      input.replace(/-/g, "+").replace(/_/g, "/") +
      "===".slice((input.length + 3) % 4);
    const binary = atob(padded);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return bytes;
  } catch {
    return null;
  }
}

function encodeJsonBase64Url(obj: unknown): string {
  const encoded = new TextEncoder().encode(JSON.stringify(obj));
  return bytesToBase64Url(encoded);
}

function decodeJsonBase64Url<T>(segment: string): T | null {
  const bytes = base64UrlToBytes(segment);
  if (!bytes) return null;
  try {
    const json = new TextDecoder().decode(bytes);
    return JSON.parse(json) as T;
  } catch {
    return null;
  }
}

async function importHmacKey(): Promise<CryptoKey> {
  const secretBytes = new TextEncoder().encode(getSessionSecret());
  return globalThis.crypto.subtle.importKey(
    "raw",
    secretBytes,
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"]
  );
}

export async function signSessionToken(
  payload: Omit<SessionTokenPayload, "exp">,
  ttlSeconds: number = SESSION_TTL_SECONDS
): Promise<string> {
  const fullPayload: SessionTokenPayload = {
    ...payload,
    exp: Math.floor(Date.now() / 1000) + ttlSeconds,
  };
  const encodedPayload = encodeJsonBase64Url(fullPayload);
  const key = await importHmacKey();
  const data = new TextEncoder().encode(encodedPayload);
  const signatureBuffer = await globalThis.crypto.subtle.sign("HMAC", key, data);
  const signature = bytesToBase64Url(new Uint8Array(signatureBuffer));
  return `${encodedPayload}.${signature}`;
}

export async function verifySessionToken(
  token: string | undefined | null
): Promise<SessionTokenPayload | null> {
  if (!token || typeof token !== "string") return null;

  const dotIdx = token.indexOf(".");
  if (dotIdx <= 0 || dotIdx === token.length - 1) return null;

  const encodedPayload = token.slice(0, dotIdx);
  const encodedSig = token.slice(dotIdx + 1);
  if (!encodedPayload || !encodedSig || encodedSig.includes(".")) return null;

  const sigBytes = base64UrlToBytes(encodedSig);
  if (!sigBytes) return null;

  try {
    const key = await importHmacKey();
    const data = new TextEncoder().encode(encodedPayload);
    const sigCopy = new Uint8Array(sigBytes.length);
    sigCopy.set(sigBytes);
    const valid = await globalThis.crypto.subtle.verify(
      "HMAC",
      key,
      sigCopy,
      data
    );
    if (!valid) return null;

    const parsed = decodeJsonBase64Url<SessionTokenPayload>(encodedPayload);
    if (!parsed || typeof parsed !== "object") return null;

    const nowSec = Math.floor(Date.now() / 1000);
    if (
      typeof parsed.userId !== "number" ||
      !Number.isInteger(parsed.userId) ||
      typeof parsed.email !== "string" ||
      !parsed.email ||
      typeof parsed.name !== "string" ||
      !parsed.name ||
      typeof parsed.role !== "string" ||
      !ADMIN_ROLES.includes(parsed.role as AdminRole) ||
      typeof parsed.avatarInitials !== "string" ||
      typeof parsed.exp !== "number" ||
      parsed.exp <= nowSec
    ) {
      return null;
    }

    return parsed;
  } catch {
    return null;
  }
}
