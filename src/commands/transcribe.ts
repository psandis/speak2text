import { readdirSync, writeFileSync } from "node:fs";
import { basename, extname, join, resolve } from "node:path";
import chalk from "chalk";
import { insertTranscript } from "../lib/db.js";
import { checkFfmpeg, cleanupTmp, convertToMp3, isNativelySupported } from "../lib/ffmpeg.js";
import { getProvider } from "../providers/index.js";
import type { ProviderName, TranscribeOptions, TranscriptFormat } from "../types.js";

const AUDIO_EXTENSIONS = new Set([".mp3", ".mp4", ".m4a", ".wav", ".webm", ".mkv", ".mov", ".avi", ".flac", ".ogg"]);

function resolveInputFiles(file?: string): string[] {
  if (file) return [resolve(file)];

  const inputDir = resolve("input");
  try {
    return readdirSync(inputDir)
      .filter((f) => AUDIO_EXTENSIONS.has(extname(f).toLowerCase()))
      .map((f) => join(inputDir, f));
  } catch {
    throw new Error(`No file specified and input/ directory not found at ${inputDir}`);
  }
}

async function transcribeFile(absPath: string, opts: TranscribeOptions): Promise<void> {
  const provider = await getProvider(opts.provider as ProviderName | undefined);
  const format: TranscriptFormat = (opts.format as TranscriptFormat) ?? "txt";

  let uploadPath = absPath;
  let converted = false;

  if (!isNativelySupported(absPath)) {
    checkFfmpeg();
    process.stdout.write(chalk.dim(`  ${basename(absPath)} — converting with ffmpeg...`));
    uploadPath = convertToMp3(absPath);
    converted = true;
  } else {
    process.stdout.write(chalk.dim(`  ${basename(absPath)} — transcribing...`));
  }

  try {
    if (converted) process.stdout.write(chalk.dim(" transcribing..."));
    const result = await provider.transcribe(uploadPath, opts);
    const transcript = insertTranscript({ ...result, file: absPath });

    const outDir = opts.out ? resolve(opts.out) : resolve("output");
    const outFile = join(outDir, `${basename(absPath, extname(absPath))}.${format}`);
    writeFileSync(outFile, transcript.content, "utf-8");

    process.stdout.write("\n");
    console.log(chalk.green(`  ✓ ${outFile}`) + chalk.dim(` [${transcript.id.slice(0, 8)}]`));
  } finally {
    if (converted) cleanupTmp(uploadPath);
  }
}

export async function transcribe(file: string | undefined, opts: TranscribeOptions): Promise<void> {
  const files = resolveInputFiles(file);

  if (files.length === 0) {
    console.log(chalk.dim("No audio files found in input/"));
    return;
  }

  console.log(chalk.bold(`Transcribing ${files.length} file(s)...`));

  for (const f of files) {
    await transcribeFile(f, opts);
  }

  console.log(chalk.bold(`\nDone.`));
}
