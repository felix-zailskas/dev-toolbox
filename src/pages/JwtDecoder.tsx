import { useMemo } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import JwtInput from "@/components/jwt/JwtInput";
import JwtSection from "@/components/jwt/JwtSection";
import SignatureVerify from "@/components/jwt/SignatureVerify";
import JwtEncoder from "@/components/jwt/JwtEncoder";
import { decodeJwt, isExpired, getExpirationDate } from "@/lib/jwt";
import { useSessionState } from "@/hooks/useSessionState";

function DecoderTab() {
  const [token, setToken] = useSessionState("jwt:decoder:token", "");

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
    <div className="flex flex-col gap-4">
      <JwtInput value={token} onChange={setToken} onClear={handleClear} />

      {isError && (
        <div className="text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md p-3">
          {decoded.message}
        </div>
      )}

      {isValid && (
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
      )}

      <div className="flex gap-4">
        <JwtSection label="Header" data={isValid ? decoded.header : null} />
        <JwtSection label="Payload" data={isValid ? decoded.payload : null} />
      </div>

      <SignatureVerify token={token} />
    </div>
  );
}

export default function JwtDecoder() {
  return (
    <div className="p-6 flex flex-col gap-4">
      <h1 className="text-2xl font-bold">JWT Tool</h1>
      <Tabs defaultValue={sessionStorage.getItem("jwt:activeTab") ?? "decoder"} onValueChange={(v) => sessionStorage.setItem("jwt:activeTab", v)}>
        <TabsList>
          <TabsTrigger value="decoder">Decoder</TabsTrigger>
          <TabsTrigger value="encoder">Encoder</TabsTrigger>
        </TabsList>
        <TabsContent value="decoder" className="mt-4">
          <DecoderTab />
        </TabsContent>
        <TabsContent value="encoder" className="mt-4">
          <JwtEncoder />
        </TabsContent>
      </Tabs>
    </div>
  );
}
