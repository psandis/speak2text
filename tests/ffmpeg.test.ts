import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { checkFfmpeg, cleanupTmp } from "../src/lib/ffmpeg.js";

let tmpDir: string;

beforeEach(() => {
  tmpDir = mkdtempSync(join(tmpdir(), "s2t-test-"));
});

afterEach(() => {
  rmSync(tmpDir, { recursive: true, force: true });
});

describe("checkFfmpeg", () => {
  it("does not throw when ffmpeg is installed", () => {
    expect(() => checkFfmpeg()).not.toThrow();
  });
});

describe("cleanupTmp", () => {
  it("removes an existing file without throwing", () => {
    const file = join(tmpDir, "test.wav");
    writeFileSync(file, "data");
    expect(() => cleanupTmp(file)).not.toThrow();
  });

  it("does not throw for a non-existent file", () => {
    expect(() => cleanupTmp(join(tmpDir, "missing.wav"))).not.toThrow();
  });
});
