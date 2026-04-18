import { execFileSync, spawnSync } from "node:child_process";
import { existsSync, mkdirSync, unlinkSync } from "node:fs";
import { tmpdir } from "node:os";
import { basename, extname, join } from "node:path";
import { randomUUID } from "node:crypto";

const OPENAI_SUPPORTED = new Set([".mp3", ".mp4", ".m4a", ".wav", ".webm"]);

export function isNativelySupported(filePath: string): boolean {
  return OPENAI_SUPPORTED.has(extname(filePath).toLowerCase());
}

export function checkFfmpeg(): void {
  const result = spawnSync("ffmpeg", ["-version"], { stdio: "ignore" });
  if (result.error) {
    throw new Error(
      "ffmpeg not found. Install it first:\n  macOS: brew install ffmpeg\n  Linux: sudo apt install ffmpeg\n  Windows: winget install ffmpeg",
    );
  }
}

export function convertToMp3(inputPath: string): string {
  if (!existsSync(inputPath)) {
    throw new Error(`File not found: ${inputPath}`);
  }

  const tmpDir = join(tmpdir(), "speak2text");
  if (!existsSync(tmpDir)) mkdirSync(tmpDir, { recursive: true });

  const name = basename(inputPath, extname(inputPath));
  const outPath = join(tmpDir, `${name}-${randomUUID()}.mp3`);

  try {
    execFileSync("ffmpeg", [
      "-i", inputPath,
      "-vn",
      "-codec:a", "libmp3lame",
      "-qscale:a", "2",
      "-y",
      outPath,
    ], { stdio: "pipe" });
  } catch {
    throw new Error(`ffmpeg could not convert: ${inputPath}\nThe file may be corrupted, DRM-protected, or in an unsupported format.`);
  }

  return outPath;
}

export function cleanupTmp(filePath: string): void {
  try {
    unlinkSync(filePath);
  } catch {
    // best-effort cleanup
  }
}
