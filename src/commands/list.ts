import chalk from "chalk";
import { getTranscripts } from "../lib/db.js";
import type { ListOptions } from "../types.js";

export function list(opts: ListOptions, json: boolean): void {
  const transcripts = getTranscripts(opts);

  if (json) {
    console.log(JSON.stringify(transcripts, null, 2));
    return;
  }

  if (transcripts.length === 0) {
    console.log(chalk.dim("No transcripts found."));
    return;
  }

  for (const t of transcripts) {
    const date = new Date(t.createdAt).toLocaleString();
    const duration = t.duration ? ` ${Math.round(t.duration)}s` : "";
    const lang = t.language ? ` [${t.language}]` : "";
    console.log(`${chalk.cyan(t.id.slice(0, 8))}  ${chalk.bold(t.provider)}${duration}${lang}  ${chalk.dim(date)}  ${t.file}`);
  }
}
