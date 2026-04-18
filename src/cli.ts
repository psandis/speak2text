import { Command } from "commander";
import chalk from "chalk";
import { closeDb, initDb } from "./lib/db.js";
import { ensureDataDir, getApiKey, loadConfig } from "./lib/config.js";
import pkg from "../package.json" with { type: "json" };

const { version } = pkg;

function checkSetup(): void {
  const config = loadConfig();
  const key = getApiKey(config.provider);
  if (!key) {
    console.error(chalk.red("No API key configured."));
    console.error("");
    console.error(chalk.bold("Quick setup:"));
    console.error(chalk.dim("  1. Create ~/.speak2text/.env"));
    console.error(chalk.dim("  2. Add: OPENAI_API_KEY=your-key-here"));
    console.error("");
    console.error(chalk.dim("Get a key at: https://platform.openai.com/api-keys"));
    console.error(chalk.dim("Using a different provider? Run: s2t config set provider grok|gemini"));
    process.exit(1);
  }
}

const program = new Command();

program
  .name("s2t")
  .description("speak2text CLI. Transcribe and translate audio and video files using OpenAI Whisper.")
  .version(version);

program
  .command("transcribe [file]")
  .description("Transcribe a file, or all files in input/ if no file given")
  .option("--provider <name>", "Provider to use: openai, grok, gemini")
  .option("--format <fmt>", "Output format: txt, srt, json (default: txt)")
  .option("--language <lang>", "Language hint (e.g. en, fi, de)")
  .option("--out <dir>", "Output directory (default: ./output)")
  .option("--translate <lang>", "Translate to language code, e.g. en, fi, sv (OpenAI only)")
  .action(async (file, opts) => {
    const { transcribe } = await import("./commands/transcribe.js");
    if (opts.translate) {
      const { isValidLanguage } = await import("./lib/languages.js");
      if (!isValidLanguage(opts.translate)) {
        console.error(chalk.red(`Unknown language code: "${opts.translate}"`));
        console.error(chalk.dim("Run: s2t languages"));
        process.exit(1);
      }
    }
    ensureDataDir();
    checkSetup();
    initDb();
    try {
      await transcribe(file, { provider: opts.provider, format: opts.format, language: opts.language, translate: opts.translate, out: opts.out });
    } finally {
      closeDb();
    }
  });

program
  .command("list")
  .description("List stored transcripts")
  .option("--provider <name>", "Filter by provider")
  .option("--limit <n>", "Max results", parseInt)
  .option("--json", "Output as JSON")
  .action(async (opts) => {
    const { list } = await import("./commands/list.js");
    ensureDataDir();
    initDb();
    try {
      list({ provider: opts.provider, limit: opts.limit }, !!opts.json);
    } finally {
      closeDb();
    }
  });

program
  .command("show <id>")
  .description("Show a stored transcript")
  .option("--json", "Output as JSON")
  .action(async (id, opts) => {
    const { show } = await import("./commands/show.js");
    ensureDataDir();
    initDb();
    try {
      show(id, !!opts.json);
    } finally {
      closeDb();
    }
  });

program
  .command("export <id>")
  .description("Export a stored transcript to a file")
  .option("--format <fmt>", "Output format: txt, srt, json")
  .option("--out <path>", "Output file path")
  .action(async (id, opts) => {
    const { exportTranscript } = await import("./commands/export.js");
    ensureDataDir();
    initDb();
    try {
      exportTranscript(id, { format: opts.format, out: opts.out });
    } finally {
      closeDb();
    }
  });

program
  .command("delete <id>")
  .description("Delete a stored transcript")
  .action(async (id) => {
    const { remove } = await import("./commands/delete.js");
    ensureDataDir();
    initDb();
    try {
      remove(id);
    } finally {
      closeDb();
    }
  });

program
  .command("languages")
  .description("List all supported language codes")
  .option("--json", "Output as JSON")
  .action(async (opts) => {
    const { languages } = await import("./commands/languages.js");
    languages(!!opts.json);
  });

const config = program.command("config").description("Manage configuration");

config
  .command("set <key> <value>")
  .description("Set a config value (openai.key, grok.key, gemini.key, provider)")
  .action(async (key, value) => {
    const { configSet } = await import("./commands/config.js");
    ensureDataDir();
    configSet(key, value);
  });

config
  .command("get [key]")
  .description("Show config value(s)")
  .option("--json", "Output as JSON")
  .action(async (key, opts) => {
    const { configGet } = await import("./commands/config.js");
    ensureDataDir();
    configGet(key, !!opts.json);
  });

program.parse();
