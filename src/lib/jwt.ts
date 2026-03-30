export interface DecodedJwt {
  header: Record<string, unknown>;
  payload: Record<string, unknown>;
  signature: string;
}

export interface JwtError {
  message: string;
}

function base64UrlDecode(str: string): string {
  const padded = str.replace(/-/g, "+").replace(/_/g, "/");
  const pad = padded.length % 4 === 0 ? "" : "=".repeat(4 - (padded.length % 4));
  return atob(padded + pad);
}

export function decodeJwt(token: string): DecodedJwt | JwtError {
  const parts = token.trim().split(".");
  if (parts.length !== 3) {
    return { message: "Invalid JWT: expected 3 parts separated by dots" };
  }

  try {
    const header = JSON.parse(base64UrlDecode(parts[0]));
    const payload = JSON.parse(base64UrlDecode(parts[1]));
    return { header, payload, signature: parts[2] };
  } catch {
    return { message: "Invalid JWT: failed to decode base64url or parse JSON" };
  }
}

export function isExpired(payload: Record<string, unknown>): boolean | null {
  if (typeof payload.exp !== "number") return null;
  return Date.now() >= payload.exp * 1000;
}

export function getExpirationDate(payload: Record<string, unknown>): Date | null {
  if (typeof payload.exp !== "number") return null;
  return new Date(payload.exp * 1000);
}

function base64UrlEncode(str: string): string {
  return btoa(str)
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

export const SUPPORTED_ALGORITHMS = ["HS256", "HS384", "HS512"] as const;
export type HmacAlgorithm = (typeof SUPPORTED_ALGORITHMS)[number];

const HMAC_ALGORITHMS: Record<string, string> = {
  HS256: "SHA-256",
  HS384: "SHA-384",
  HS512: "SHA-512",
};

export async function verifyHmacSignature(
  token: string,
  secret: string
): Promise<{ valid: boolean; error?: string }> {
  const parts = token.trim().split(".");
  if (parts.length !== 3) return { valid: false, error: "Invalid token" };

  try {
    const header = JSON.parse(base64UrlDecode(parts[0]));
    const alg = header.alg as string;
    const hashAlg = HMAC_ALGORITHMS[alg];

    if (!hashAlg) {
      return { valid: false, error: `Unsupported algorithm: ${alg}. Only HS256/HS384/HS512 supported.` };
    }

    const encoder = new TextEncoder();
    const keyData = encoder.encode(secret);
    const key = await crypto.subtle.importKey(
      "raw",
      keyData,
      { name: "HMAC", hash: hashAlg },
      false,
      ["sign"]
    );

    const signatureInput = encoder.encode(`${parts[0]}.${parts[1]}`);
    const signatureBytes = await crypto.subtle.sign("HMAC", key, signatureInput);

    const computed = btoa(String.fromCharCode(...new Uint8Array(signatureBytes)))
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/, "");

    return { valid: computed === parts[2] };
  } catch {
    return { valid: false, error: "Verification failed" };
  }
}

export async function encodeJwt(
  header: Record<string, unknown>,
  payload: Record<string, unknown>,
  secret: string
): Promise<{ token: string } | { error: string }> {
  const alg = header.alg as string;
  const hashAlg = HMAC_ALGORITHMS[alg];

  if (!hashAlg) {
    return { error: `Unsupported algorithm: ${alg}. Only HS256/HS384/HS512 supported.` };
  }

  try {
    const headerB64 = base64UrlEncode(JSON.stringify(header));
    const payloadB64 = base64UrlEncode(JSON.stringify(payload));
    const signingInput = `${headerB64}.${payloadB64}`;

    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey(
      "raw",
      encoder.encode(secret),
      { name: "HMAC", hash: hashAlg },
      false,
      ["sign"]
    );

    const signatureBytes = await crypto.subtle.sign("HMAC", key, encoder.encode(signingInput));
    const signature = btoa(String.fromCharCode(...new Uint8Array(signatureBytes)))
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/, "");

    return { token: `${signingInput}.${signature}` };
  } catch {
    return { error: "Failed to encode JWT" };
  }
}
