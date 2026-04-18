import chalk from "chalk";
import { getTranscriptById } from "../lib/db.js";

export function show(id: string, json: boolean): void {
  const transcript = getTranscriptById(id);

  if (!transcript) {
    console.error(chalk.red(`Transcript not found: ${id}`));
    process.exit(1);
  }

  if (json) {
    console.log(JSON.stringify(transcript, null, 2));
    return;
  }

  console.log(chalk.dim(`id:       `) + transcript.id);
  console.log(chalk.dim(`file:     `) + transcript.file);
  console.log(chalk.dim(`provider: `) + transcript.provider);
  console.log(chalk.dim(`format:   `) + transcript.format);
  console.log(chalk.dim(`language: `) + (transcript.language ?? "—"));
  console.log(chalk.dim(`duration: `) + (transcript.duration ? `${Math.round(transcript.duration)}s` : "—"));
  console.log(chalk.dim(`created:  `) + new Date(transcript.createdAt).toLocaleString());
  console.log();
  console.log(transcript.content);
}
