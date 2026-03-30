import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Copy, FolderOpen } from "lucide-react";
import { open } from "@tauri-apps/plugin-dialog";
import { readTextFile } from "@tauri-apps/plugin-fs";
import { encodeJwt, SUPPORTED_ALGORITHMS, type HmacAlgorithm } from "@/lib/jwt";
import { useSessionState } from "@/hooks/useSessionState";
import { loadConfig } from "@/lib/config";

const DEFAULT_PAYLOAD = JSON.stringify(
  {
    iss: "",
    sub: "",
    aud: "",
    exp: Math.floor(Date.now() / 1000) + 3600,
    nbf: Math.floor(Date.now() / 1000),
    iat: Math.floor(Date.now() / 1000),
    jti: "",
  },
  null,
  2
);

export default function JwtEncoder() {
  const [algorithm, setAlgorithm] = useSessionState<HmacAlgorithm>("jwt:encoder:algorithm", "HS256");
  const [payloadText, setPayloadText] = useSessionState("jwt:encoder:payload", DEFAULT_PAYLOAD);
  const [secret, setSecret] = useSessionState("jwt:encoder:secret", "");
  const [keyPath, setKeyPath] = useSessionState("jwt:encoder:keyPath", "");
  const [output, setOutput] = useSessionState("jwt:encoder:output", "");
  const [error, setError] = useState("");

  // Load default key from config on first mount if no key is set
  useEffect(() => {
    if (secret) return;
    loadConfig().then(async (config) => {
      if (!config.defaultJwtKeyPath) return;
      try {
        const contents = await readTextFile(config.defaultJwtKeyPath);
        setSecret(contents.trim());
        setKeyPath(config.defaultJwtKeyPath);
      } catch {
        // Config points to a missing file — ignore silently
      }
    });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSelectKeyFile = async () => {
    const selected = await open({
      multiple: false,
      directory: false,
      filters: [{ name: "Key files", extensions: ["pem", "key", "txt", "*"] }],
    });
    if (!selected) return;

    try {
      const contents = await readTextFile(selected);
      setSecret(contents.trim());
      setKeyPath(selected);
    } catch {
      setError("Failed to read key file");
    }
  };

  const handleEncode = async () => {
    setError("");
    setOutput("");

    let payload: Record<string, unknown>;
    try {
      payload = JSON.parse(payloadText);
    } catch {
      setError("Invalid JSON in payload");
      return;
    }

    // Strip empty string claims
    const cleanPayload = Object.fromEntries(
      Object.entries(payload).filter(([, v]) => v !== "")
    );

    const header = { alg: algorithm, typ: "JWT" };
    const result = await encodeJwt(header, cleanPayload, secret);

    if ("error" in result) {
      setError(result.error);
    } else {
      setOutput(result.token);
    }
  };

  const handleCopy = () => navigator.clipboard.writeText(output);

  return (
    <div className="flex flex-col gap-4">
      {/* Algorithm selector */}
      <div className="flex flex-col gap-2">
        <span className="text-sm font-medium text-foreground">Algorithm</span>
        <Select value={algorithm} onValueChange={(v) => setAlgorithm(v as HmacAlgorithm)}>
          <SelectTrigger className="w-[200px] bg-card border-border">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {SUPPORTED_ALGORITHMS.map((alg) => (
              <SelectItem key={alg} value={alg}>
                {alg}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Payload editor */}
      <div className="flex flex-col gap-2">
        <span className="text-sm font-medium text-foreground">Payload</span>
        <Textarea
          value={payloadText}
          onChange={(e) => setPayloadText(e.target.value)}
          className="min-h-[200px] font-mono text-sm bg-card border-border resize-y"
        />
      </div>

      {/* Signing key */}
      <div className="flex flex-col gap-2">
        <span className="text-sm font-medium text-foreground">Signing Key</span>
        <div className="flex gap-2">
          <Input
            type="password"
            value={secret}
            onChange={(e) => { setSecret(e.target.value); setKeyPath(""); }}
            placeholder="Enter secret or select key file..."
            className="font-mono text-sm bg-card border-border flex-1"
          />
          <Button variant="secondary" onClick={handleSelectKeyFile}>
            <FolderOpen className="h-4 w-4 mr-2" />
            Browse
          </Button>
        </div>
        {keyPath && (
          <span className="text-xs text-muted-foreground truncate">
            Loaded from: {keyPath}
          </span>
        )}
      </div>

      {/* Encode button */}
      <Button onClick={handleEncode} disabled={!secret}>
        Generate Token
      </Button>

      {/* Error */}
      {error && (
        <div className="text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md p-3">
          {error}
        </div>
      )}

      {/* Output */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-foreground">Generated Token</span>
          {output && (
            <Button variant="ghost" size="icon" onClick={handleCopy} className="h-6 w-6">
              <Copy className="h-3 w-3" />
            </Button>
          )}
        </div>
        <pre className="bg-card border border-border rounded-md p-4 font-mono text-sm overflow-auto min-h-[60px] break-all whitespace-pre-wrap">
          {output || <span className="text-muted-foreground">Token will appear here...</span>}
        </pre>
      </div>
    </div>
  );
}
