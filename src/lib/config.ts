import { readTextFile, writeTextFile, exists, mkdir } from "@tauri-apps/plugin-fs";
import { homeDir } from "@tauri-apps/api/path";

export interface AppConfig {
  defaultJwtKeyPath?: string;
}

const CONFIG_DIR = ".config/dev-toolbox";
const CONFIG_FILE = "config.json";

async function getConfigPath(): Promise<string> {
  const home = await homeDir();
  const sep = home.endsWith("/") ? "" : "/";
  return `${home}${sep}${CONFIG_DIR}/${CONFIG_FILE}`;
}

async function getConfigDir(): Promise<string> {
  const home = await homeDir();
  const sep = home.endsWith("/") ? "" : "/";
  return `${home}${sep}${CONFIG_DIR}`;
}

export async function loadConfig(): Promise<AppConfig> {
  try {
    const path = await getConfigPath();
    const fileExists = await exists(path);
    if (!fileExists) return {};
    const contents = await readTextFile(path);
    return JSON.parse(contents) as AppConfig;
  } catch {
    return {};
  }
}

export async function saveConfig(config: AppConfig): Promise<void> {
  const dir = await getConfigDir();
  const dirExists = await exists(dir);
  if (!dirExists) {
    await mkdir(dir, { recursive: true });
  }
  const path = await getConfigPath();
  await writeTextFile(path, JSON.stringify(config, null, 2));
}
