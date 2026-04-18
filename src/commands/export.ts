import { writeFileSync } from "node:fs";
import { resolve } from "node:path";
import chalk from "chalk";
import { getExportsDir } from "../lib/config.js";
import { getTranscriptById } from "../lib/db.js";
import type { ExportOptions } from "../types.js";

export function exportTranscript(id: string, opts: ExportOptions): void {
  const transcript = getTranscriptById(id);

  if (!transcript) {
    console.error(chalk.red(`Transcript not found: ${id}`));
    process.exit(1);
  }

  const format = opts.format ?? transcript.format;
  const outFile = opts.out
    ? resolve(opts.out)
    : `${getExportsDir()}/${transcript.id}.${format}`;

  writeFileSync(outFile, transcript.content, "utf-8");
  console.log(chalk.green(`✓ Exported to ${outFile}`));
}
