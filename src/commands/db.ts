import { statSync } from "node:fs";
import { basename } from "node:path";
import chalk from "chalk";
import { getDbPath } from "../lib/config.js";
import { getDbStats, getDistinctFiles } from "../lib/db.js";

export function dbStats(): void {
  const stats = getDbStats();
  const dbPath = getDbPath();

  let fileSize = "unknown";
  try {
    const bytes = statSync(dbPath).size;
    fileSize = bytes < 1024 * 1024
      ? `${(bytes / 1024).toFixed(1)} KB`
      : `${(bytes / 1024 / 1024).toFixed(2)} MB`;
  } catch {
    // db file may not exist yet
  }

  console.log(chalk.bold("Database stats"));
  console.log(`  Path:        ${dbPath}`);
  console.log(`  Size:        ${fileSize}`);
  console.log(`  Transcripts: ${stats.count}`);

  if (stats.count > 0) {
    console.log(`  Oldest:      ${stats.oldest ? new Date(stats.oldest).toLocaleString() : "-"}`);
    console.log(`  Newest:      ${stats.newest ? new Date(stats.newest).toLocaleString() : "-"}`);

    if (Object.keys(stats.byProvider).length > 0) {
      console.log(chalk.bold("\nBy provider"));
      for (const [provider, count] of Object.entries(stats.byProvider)) {
        console.log(`  ${provider}: ${count}`);
      }
    }
  }
}

export function dbList(): void {
  const files = getDistinctFiles();

  if (files.length === 0) {
    console.log(chalk.dim("No transcripts stored."));
    return;
  }

  console.log(chalk.bold(`${files.length} file(s) transcribed\n`));
  for (const f of files) {
    const date = new Date(f.newest).toLocaleString();
    const count = f.count > 1 ? chalk.dim(` (${f.count} transcripts)`) : "";
    console.log(`  ${basename(f.file)}${count}`);
    console.log(chalk.dim(`    ${f.file}`));
    console.log(chalk.dim(`    Last transcribed: ${date}`));
  }
}
