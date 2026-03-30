import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { FolderOpen, Check } from "lucide-react";
import { open } from "@tauri-apps/plugin-dialog";
import { loadConfig, saveConfig, type AppConfig } from "@/lib/config";

export default function Settings() {
  const [config, setConfig] = useState<AppConfig>({});
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    loadConfig().then(setConfig);
  }, []);

  const handleSelectKeyFile = async () => {
    const selected = await open({
      multiple: false,
      directory: false,
      filters: [{ name: "Key files", extensions: ["pem", "key", "txt", "*"] }],
    });
    if (selected) {
      setConfig((prev) => ({ ...prev, defaultJwtKeyPath: selected }));
      setSaved(false);
    }
  };

  const [error, setError] = useState("");

  const handleSave = async () => {
    setError("");
    try {
      await saveConfig(config);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    }
  };

  return (
    <div className="p-6 flex flex-col gap-6 max-w-2xl">
      <h1 className="text-2xl font-bold">Settings</h1>

      <div className="flex flex-col gap-2">
        <span className="text-sm font-medium text-foreground">Default JWT Signing Key File</span>
        <span className="text-xs text-muted-foreground">
          Pre-fills the signing key in the JWT Encoder when no key is loaded.
        </span>
        <div className="flex gap-2">
          <Input
            value={config.defaultJwtKeyPath ?? ""}
            onChange={(e) => {
              setConfig((prev) => ({ ...prev, defaultJwtKeyPath: e.target.value }));
              setSaved(false);
            }}
            placeholder="No default key file configured"
            className="font-mono text-sm bg-card border-border flex-1"
          />
          <Button variant="secondary" onClick={handleSelectKeyFile}>
            <FolderOpen className="h-4 w-4 mr-2" />
            Browse
          </Button>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <Button onClick={handleSave}>Save Settings</Button>
        {saved && (
          <span className="text-sm text-primary flex items-center gap-1">
            <Check className="h-4 w-4" /> Saved
          </span>
        )}
      </div>

      {error && (
        <div className="text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md p-3">
          {error}
        </div>
      )}

      <p className="text-xs text-muted-foreground">
        Settings are stored in <code className="font-mono">~/.config/dev-toolbox/config.json</code>
      </p>
    </div>
  );
}
