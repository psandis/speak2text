import Database from "better-sqlite3";
import { randomUUID } from "node:crypto";
import { getDbPath } from "./config.js";
import type { ListOptions, Transcript, TranscriptFormat, ProviderName } from "../types.js";

let db: Database.Database | null = null;

export function getDb(): Database.Database {
  if (!db) throw new Error("Database not initialized — call initDb() first");
  return db;
}

export function initDb(): void {
  db = new Database(getDbPath());
  db.pragma("journal_mode = WAL");
  db.pragma("foreign_keys = ON");
  db.exec(`
    CREATE TABLE IF NOT EXISTS transcripts (
      id          TEXT PRIMARY KEY,
      file        TEXT NOT NULL,
      provider    TEXT NOT NULL,
      format      TEXT NOT NULL,
      content     TEXT NOT NULL,
      duration    REAL,
      language    TEXT,
      created_at  TEXT NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_transcripts_provider ON transcripts(provider);
    CREATE INDEX IF NOT EXISTS idx_transcripts_created ON transcripts(created_at);
  `);
}

export function closeDb(): void {
  db?.close();
  db = null;
}

export function insertTranscript(data: Omit<Transcript, "id" | "createdAt">): Transcript {
  const transcript: Transcript = {
    id: randomUUID(),
    ...data,
    createdAt: new Date().toISOString(),
  };
  getDb()
    .prepare(
      `INSERT INTO transcripts (id, file, provider, format, content, duration, language, created_at)
       VALUES (@id, @file, @provider, @format, @content, @duration, @language, @createdAt)`,
    )
    .run({
      id: transcript.id,
      file: transcript.file,
      provider: transcript.provider,
      format: transcript.format,
      content: transcript.content,
      duration: transcript.duration ?? null,
      language: transcript.language ?? null,
      createdAt: transcript.createdAt,
    });
  return transcript;
}

export function getTranscripts(opts: ListOptions = {}): Transcript[] {
  const conditions: string[] = [];
  const params: Record<string, unknown> = {};

  if (opts.provider) {
    conditions.push("provider = @provider");
    params.provider = opts.provider;
  }

  const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";
  const limit = opts.limit ? `LIMIT ${opts.limit}` : "";

  const rows = getDb()
    .prepare(`SELECT * FROM transcripts ${where} ORDER BY created_at DESC ${limit}`)
    .all(params) as Record<string, unknown>[];

  return rows.map(rowToTranscript);
}

export function getTranscriptById(id: string): Transcript | null {
  const row = getDb()
    .prepare("SELECT * FROM transcripts WHERE id = ?")
    .get(id) as Record<string, unknown> | undefined;
  return row ? rowToTranscript(row) : null;
}

export function deleteTranscript(id: string): boolean {
  const result = getDb().prepare("DELETE FROM transcripts WHERE id = ?").run(id);
  return result.changes > 0;
}

export function deleteAllTranscripts(): number {
  const result = getDb().prepare("DELETE FROM transcripts").run();
  return result.changes;
}

export interface DbStats {
  count: number;
  byProvider: Record<string, number>;
  oldest: string | null;
  newest: string | null;
}

export function getDbStats(): DbStats {
  const db = getDb();
  const count = (db.prepare("SELECT COUNT(*) as n FROM transcripts").get() as { n: number }).n;
  const providerRows = db.prepare("SELECT provider, COUNT(*) as n FROM transcripts GROUP BY provider").all() as { provider: string; n: number }[];
  const byProvider: Record<string, number> = {};
  for (const row of providerRows) byProvider[row.provider] = row.n;
  const dates = db.prepare("SELECT MIN(created_at) as oldest, MAX(created_at) as newest FROM transcripts").get() as { oldest: string | null; newest: string | null };
  return { count, byProvider, oldest: dates.oldest, newest: dates.newest };
}

export function getDistinctFiles(): { file: string; count: number; newest: string }[] {
  return getDb()
    .prepare("SELECT file, COUNT(*) as count, MAX(created_at) as newest FROM transcripts GROUP BY file ORDER BY newest DESC")
    .all() as { file: string; count: number; newest: string }[];
}

function rowToTranscript(row: Record<string, unknown>): Transcript {
  return {
    id: row.id as string,
    file: row.file as string,
    provider: row.provider as ProviderName,
    format: row.format as TranscriptFormat,
    content: row.content as string,
    duration: row.duration as number | null,
    language: row.language as string | null,
    createdAt: row.created_at as string,
  };
}
