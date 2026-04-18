import chalk from "chalk";
import { loadConfig, saveConfig } from "../lib/config.js";
import type { ProviderName, S2TConfig } from "../types.js";

const PROVIDERS: ProviderName[] = ["openai", "grok", "gemini"];

const KEY_MAP: Record<string, keyof S2TConfig> = {
  "openai.key": "openaiApiKey",
  "grok.key": "grokApiKey",
  "gemini.key": "geminiApiKey",
  "provider": "provider",
};

const ENV_MAP: Record<string, string> = {
  "openai.key": "OPENAI_API_KEY",
  "grok.key": "GROK_API_KEY",
  "gemini.key": "GEMINI_API_KEY",
};

export function configSet(key: string, value: string): void {
  const configKey = KEY_MAP[key];
  if (!configKey) {
    console.error(chalk.red(`Unknown config key: ${key}`));
    console.error(chalk.dim(`Valid keys: ${Object.keys(KEY_MAP).join(", ")}`));
    process.exit(1);
  }

  if (key === "provider" && !PROVIDERS.includes(value as ProviderName)) {
    console.error(chalk.red(`Unknown provider: ${value}`));
    console.error(chalk.dim(`Valid providers: ${PROVIDERS.join(", ")}`));
    process.exit(1);
  }

  const envKey = ENV_MAP[key];
  if (envKey) {
    console.log(chalk.dim(`Tip: you can also set ${envKey} in ~/.speak2text/.env`));
  }

  const config = loadConfig();
  (config as Record<string, unknown>)[configKey] = value;
  saveConfig(config);
  console.log(chalk.green(`✓ Set ${key}`));
}

export function configGet(key?: string, json?: boolean): void {
  const config = loadConfig();

  if (json) {
    const safe = { ...config, openaiApiKey: config.openaiApiKey ? "***" : undefined, grokApiKey: config.grokApiKey ? "***" : undefined, geminiApiKey: config.geminiApiKey ? "***" : undefined };
    console.log(JSON.stringify(safe, null, 2));
    return;
  }

  if (key) {
    const configKey = KEY_MAP[key];
    if (!configKey) {
      console.error(chalk.red(`Unknown config key: ${key}`));
      process.exit(1);
    }
    const value = config[configKey];
    const isApiKey = key.endsWith(".key");
    console.log(isApiKey && value ? "***" : (value ?? chalk.dim("not set")));
    return;
  }

  console.log(chalk.dim("provider:   ") + config.provider);
  console.log(chalk.dim("openai.key: ") + (config.openaiApiKey ? chalk.green("set") : chalk.dim("not set")));
  console.log(chalk.dim("grok.key:   ") + (config.grokApiKey ? chalk.green("set") : chalk.dim("not set")));
  console.log(chalk.dim("gemini.key: ") + (config.geminiApiKey ? chalk.green("set") : chalk.dim("not set")));
}
