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
