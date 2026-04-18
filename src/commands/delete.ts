import chalk from "chalk";
import { deleteAllTranscripts, deleteTranscript } from "../lib/db.js";

export function remove(id: string): void {
  const deleted = deleteTranscript(id);

  if (!deleted) {
    console.error(chalk.red(`Transcript not found: ${id}`));
    process.exit(1);
  }

  console.log(chalk.green(`✓ Deleted ${id}`));
}

export function removeAll(): void {
  const count = deleteAllTranscripts();
  console.log(chalk.green(`✓ Deleted ${count} transcript(s)`));
}
