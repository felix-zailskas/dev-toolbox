---
date: 2026-03-27T16:00:00
author: Claude
topic: "Phase 4: JWT Decoder"
status: approved
---

# Phase 4: JWT Decoder

## Overview

Build the JWT decoder: a text area to paste a token, live decode of header and payload into syntax-highlighted JSON panels, expiration status display, and HMAC signature verification via Web Crypto API.

## Prerequisites
- [ ] Phase 3 completed

## Changes Required

### 1. JWT utility library

**File:** `src/lib/jwt.ts`

Manual base64url decode, token parsing, and HMAC verification using Web Crypto API.

```typescript
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
```

---

### 2. JwtInput component

**File:** `src/components/jwt/JwtInput.tsx`

Token input textarea with a clear button.

```typescript
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";

interface JwtInputProps {
  value: string;
  onChange: (value: string) => void;
  onClear: () => void;
}

export default function JwtInput({ value, onChange, onClear }: JwtInputProps) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-foreground">Token</span>
        <Button variant="ghost" size="icon" onClick={onClear} className="h-6 w-6">
          <Trash2 className="h-3 w-3" />
        </Button>
      </div>
      <Textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Paste JWT here..."
        className="min-h-[100px] font-mono text-sm bg-card border-border resize-y break-all"
      />
    </div>
  );
}
```

---

### 3. JwtSection component (decoded header/payload display)

**File:** `src/components/jwt/JwtSection.tsx`

Renders a labeled read-only panel with syntax-highlighted JSON. Uses Monokai colors for JSON syntax highlighting via simple regex-based coloring.

```typescript
interface JwtSectionProps {
  label: string;
  data: Record<string, unknown>;
}

function syntaxHighlight(json: string): string {
  return json.replace(
    /("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g,
    (match) => {
      if (/^"/.test(match)) {
        if (/:$/.test(match)) {
          return `<span class="text-[#f92672]">${match}</span>`; // key — pink
        }
        return `<span class="text-[#E6DB74]">${match}</span>`; // string — yellow
      }
      if (/true|false/.test(match)) {
        return `<span class="text-[#AE81FF]">${match}</span>`; // boolean — purple
      }
      if (/null/.test(match)) {
        return `<span class="text-[#AE81FF]">${match}</span>`; // null — purple
      }
      return `<span class="text-[#AE81FF]">${match}</span>`; // number — purple
    }
  );
}

export default function JwtSection({ label, data }: JwtSectionProps) {
  const formatted = JSON.stringify(data, null, 2);
  const highlighted = syntaxHighlight(formatted);

  return (
    <div className="flex flex-col gap-2 flex-1">
      <span className="text-sm font-medium text-foreground">{label}</span>
      <pre
        className="bg-card border border-border rounded-md p-4 font-mono text-sm overflow-auto"
        dangerouslySetInnerHTML={{ __html: highlighted }}
      />
    </div>
  );
}
```

---

### 4. SignatureVerify component

**File:** `src/components/jwt/SignatureVerify.tsx`

Secret key input and verify button. Shows valid/invalid/error state.

```typescript
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { verifyHmacSignature } from "@/lib/jwt";

interface SignatureVerifyProps {
  token: string;
}

type VerifyState =
  | { status: "idle" }
  | { status: "valid" }
  | { status: "invalid" }
  | { status: "error"; message: string };

export default function SignatureVerify({ token }: SignatureVerifyProps) {
  const [secret, setSecret] = useState("");
  const [state, setState] = useState<VerifyState>({ status: "idle" });

  const handleVerify = async () => {
    if (!token || !secret) return;
    const result = await verifyHmacSignature(token, secret);
    if (result.error) {
      setState({ status: "error", message: result.error });
    } else {
      setState({ status: result.valid ? "valid" : "invalid" });
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <span className="text-sm font-medium text-foreground">Signature Verification (HMAC)</span>
      <div className="flex gap-2">
        <Input
          type="password"
          value={secret}
          onChange={(e) => { setSecret(e.target.value); setState({ status: "idle" }); }}
          placeholder="Enter secret key..."
          className="font-mono text-sm bg-card border-border flex-1"
        />
        <Button onClick={handleVerify} variant="secondary" disabled={!token || !secret}>
          Verify
        </Button>
      </div>
      {state.status === "valid" && (
        <span className="text-sm text-primary font-medium">Signature valid</span>
      )}
      {state.status === "invalid" && (
        <span className="text-sm text-destructive font-medium">Signature invalid</span>
      )}
      {state.status === "error" && (
        <span className="text-sm text-destructive font-medium">{state.message}</span>
      )}
    </div>
  );
}
```

---

### 5. JwtDecoder page

**File:** `src/pages/JwtDecoder.tsx`

Ties together: JwtInput at top, decoded header + payload panels side by side, token metadata (algorithm, expiration), signature verification at bottom.

```typescript
import { useState, useMemo } from "react";
import JwtInput from "@/components/jwt/JwtInput";
import JwtSection from "@/components/jwt/JwtSection";
import SignatureVerify from "@/components/jwt/SignatureVerify";
import { decodeJwt, isExpired, getExpirationDate } from "@/lib/jwt";

export default function JwtDecoder() {
  const [token, setToken] = useState("");

  const decoded = useMemo(() => {
    if (!token.trim()) return null;
    return decodeJwt(token);
  }, [token]);

  const isError = decoded !== null && "message" in decoded;
  const isValid = decoded !== null && !isError;

  const expired = isValid ? isExpired(decoded.payload) : null;
  const expDate = isValid ? getExpirationDate(decoded.payload) : null;
  const algorithm = isValid ? (decoded.header.alg as string) ?? "unknown" : null;

  const handleClear = () => setToken("");

  return (
    <div className="p-6 flex flex-col gap-4">
      <h1 className="text-2xl font-bold">JWT Decoder</h1>

      <JwtInput value={token} onChange={setToken} onClear={handleClear} />

      {isError && (
        <div className="text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md p-3">
          {decoded.message}
        </div>
      )}

      {isValid && (
        <>
          {/* Token metadata */}
          <div className="flex gap-4 text-sm">
            <span className="text-muted-foreground">
              Algorithm: <span className="text-foreground font-mono">{algorithm}</span>
            </span>
            {expired !== null && (
              <span className="text-muted-foreground">
                Expiration:{" "}
                <span className={expired ? "text-destructive" : "text-primary"}>
                  {expired ? "Expired" : "Valid"}
                </span>
                {expDate && (
                  <span className="text-muted-foreground ml-1">
                    ({expDate.toLocaleString()})
                  </span>
                )}
              </span>
            )}
          </div>

          {/* Decoded panels */}
          <div className="flex gap-4">
            <JwtSection label="Header" data={decoded.header} />
            <JwtSection label="Payload" data={decoded.payload} />
          </div>

          {/* Signature verification */}
          <SignatureVerify token={token} />
        </>
      )}
    </div>
  );
}
```

**Step: Run `npm run tauri dev`. Navigate to JWT Decoder. Paste a JWT — header and payload appear as highlighted JSON. Invalid tokens show error. Enter a secret and verify HMAC signature. Clear button resets everything.**

**Commit:**
```
feat: add JWT decoder with signature verification
```

---

## Success Criteria

### Automated Verification
- [ ] TypeScript compiles without errors
- [ ] Vite builds without errors

### Manual Verification
- [ ] Pasting a valid JWT decodes header and payload with syntax-highlighted JSON
- [ ] Invalid tokens show a clear error message
- [ ] Algorithm displayed from header
- [ ] Expiration status shown (green "Valid" / red "Expired") with date
- [ ] Secret key input verifies HMAC signature (HS256/HS384/HS512)
- [ ] "Signature valid" (green) or "Signature invalid" (red) displayed
- [ ] Unsupported algorithm (e.g. RS256) shows clear error on verify
- [ ] Clear button resets token and all displayed data

## Dependencies
- None (uses Web Crypto API built into the browser)
