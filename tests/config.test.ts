import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import {
  getDataDir,
  getDbPath,
  getExportsDir,
  getApiKey,
  loadConfig,
  saveConfig,
} from "../src/lib/config.js";

let tmpDir: string;

beforeEach(() => {
  tmpDir = mkdtempSync(join(tmpdir(), "s2t-test-"));
  process.env.S2T_HOME = tmpDir;
  delete process.env.OPENAI_API_KEY;
  delete process.env.GROK_API_KEY;
  delete process.env.GEMINI_API_KEY;
});

afterEach(() => {
  rmSync(tmpDir, { recursive: true, force: true });
  delete process.env.S2T_HOME;
  delete process.env.OPENAI_API_KEY;
  delete process.env.GROK_API_KEY;
  delete process.env.GEMINI_API_KEY;
});

describe("getDataDir", () => {
  it("returns S2T_HOME when set", () => {
    expect(getDataDir()).toBe(tmpDir);
  });

  it("changes when env var changes", () => {
    const other = mkdtempSync(join(tmpdir(), "s2t-other-"));
    process.env.S2T_HOME = other;
    expect(getDataDir()).toBe(other);
    rmSync(other, { recursive: true, force: true });
  });
});

describe("getDbPath", () => {
  it("returns transcripts.db inside data dir", () => {
    expect(getDbPath()).toBe(join(tmpDir, "transcripts.db"));
  });
});

describe("getExportsDir", () => {
  it("returns exports dir inside data dir", () => {
    expect(getExportsDir()).toBe(join(tmpDir, "exports"));
  });
});

describe("loadConfig", () => {
  it("returns defaults when no config file exists", () => {
    const config = loadConfig();
    expect(config.provider).toBe("openai");
  });

  it("merges saved values over defaults", () => {
    saveConfig({ provider: "grok" });
    const config = loadConfig();
    expect(config.provider).toBe("grok");
  });

  it("keeps defaults for missing fields", () => {
    saveConfig({ provider: "gemini" });
    const config = loadConfig();
    expect(config).toHaveProperty("provider");
  });
});

describe("saveConfig", () => {
  it("persists config that can be reloaded", () => {
    saveConfig({ provider: "openai", openaiApiKey: "sk-test" });
    const config = loadConfig();
    expect(config.openaiApiKey).toBe("sk-test");
  });

  it("creates data dir if it does not exist", () => {
    const nested = join(tmpDir, "nested");
    process.env.S2T_HOME = nested;
    saveConfig({ provider: "openai" });
    expect(loadConfig().provider).toBe("openai");
    rmSync(nested, { recursive: true, force: true });
  });
});

describe("getApiKey", () => {
  it("returns openai key from env", () => {
    process.env.OPENAI_API_KEY = "sk-openai";
    expect(getApiKey("openai")).toBe("sk-openai");
  });

  it("returns grok key from env", () => {
    process.env.GROK_API_KEY = "xai-grok";
    expect(getApiKey("grok")).toBe("xai-grok");
  });

  it("returns gemini key from env", () => {
    process.env.GEMINI_API_KEY = "gemini-key";
    expect(getApiKey("gemini")).toBe("gemini-key");
  });

  it("returns undefined when key not set", () => {
    expect(getApiKey("openai")).toBeUndefined();
  });

  it("returns undefined for unknown provider", () => {
    expect(getApiKey("unknown")).toBeUndefined();
  });
});

describe("loadDotEnv", () => {
  it("loads keys from .env file in data dir", async () => {
    writeFileSync(join(tmpDir, ".env"), "OPENAI_API_KEY=sk-from-env\n");
    const { ensureDataDir } = await import("../src/lib/config.js");
    ensureDataDir();
    expect(process.env.OPENAI_API_KEY).toBe("sk-from-env");
  });
});
