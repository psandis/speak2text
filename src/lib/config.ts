import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";
import type { S2TConfig } from "../types.js";

const DEFAULTS: S2TConfig = {
  provider: "openai",
};

export function getDataDir(): string {
  return process.env.S2T_HOME ?? join(homedir(), ".speak2text");
}

export function getDbPath(): string {
  return join(getDataDir(), "transcripts.db");
}

export function getExportsDir(): string {
  return join(getDataDir(), "exports");
}

export function ensureDataDir(): void {
  const dataDir = getDataDir();
  if (!existsSync(dataDir)) mkdirSync(dataDir, { recursive: true });
  const exportsDir = getExportsDir();
  if (!existsSync(exportsDir)) mkdirSync(exportsDir, { recursive: true });
  loadDotEnv();
}

function loadDotEnv(): void {
  const envFile = join(getDataDir(), ".env");
  if (!existsSync(envFile)) return;
  const lines = readFileSync(envFile, "utf-8").split("\n");
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    const value = trimmed.slice(eq + 1).trim().replace(/^["']|["']$/g, "");
    if (key && !(key in process.env)) process.env[key] = value;
  }
}

export function loadConfig(): S2TConfig {
  const configFile = join(getDataDir(), "config.json");
  if (!existsSync(configFile)) return { ...DEFAULTS };
  return { ...DEFAULTS, ...JSON.parse(readFileSync(configFile, "utf-8")) };
}

export function saveConfig(config: S2TConfig): void {
  ensureDataDir();
  writeFileSync(join(getDataDir(), "config.json"), `${JSON.stringify(config, null, 2)}\n`);
}

export function getApiKey(provider: string): string | undefined {
  const envMap: Record<string, string> = {
    openai: "OPENAI_API_KEY",
    grok: "GROK_API_KEY",
    gemini: "GEMINI_API_KEY",
  };
  const envKey = envMap[provider];
  return envKey ? process.env[envKey] : undefined;
}
