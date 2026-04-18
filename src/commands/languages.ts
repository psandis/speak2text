import chalk from "chalk";
import { LANGUAGES } from "../lib/languages.js";

export function languages(json: boolean): void {
  if (json) {
    console.log(JSON.stringify(LANGUAGES, null, 2));
    return;
  }

  const entries = Object.entries(LANGUAGES).sort((a, b) => a[1].localeCompare(b[1]));
  for (const [code, name] of entries) {
    console.log(`${chalk.cyan(code.padEnd(6))} ${name}`);
  }
}
