import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { closeDb, deleteTranscript, getTranscriptById, getTranscripts, initDb, insertTranscript } from "../src/lib/db.js";
import type { Transcript } from "../src/types.js";

let tmpDir: string;

const makeTranscript = (overrides: Partial<Omit<Transcript, "id" | "createdAt">> = {}): Omit<Transcript, "id" | "createdAt"> => ({
  file: "/tmp/test.mp3",
  provider: "openai",
  format: "txt",
  content: "Hello world, this is a test transcript.",
  duration: 5.2,
  language: "en",
  ...overrides,
});

beforeEach(() => {
  tmpDir = mkdtempSync(join(tmpdir(), "s2t-test-"));
  process.env.S2T_HOME = tmpDir;
  initDb();
});

afterEach(() => {
  closeDb();
  rmSync(tmpDir, { recursive: true, force: true });
  delete process.env.S2T_HOME;
});

describe("insertTranscript", () => {
  it("inserts and returns transcript with id and createdAt", () => {
    const t = insertTranscript(makeTranscript());
    expect(t.id).toBeTruthy();
    expect(t.createdAt).toBeTruthy();
    expect(t.content).toBe("Hello world, this is a test transcript.");
  });

  it("stores all fields correctly", () => {
    const t = insertTranscript(makeTranscript({ provider: "grok", format: "srt", language: "fi" }));
    const found = getTranscriptById(t.id);
    expect(found?.provider).toBe("grok");
    expect(found?.format).toBe("srt");
    expect(found?.language).toBe("fi");
  });

  it("stores null duration and language", () => {
    const t = insertTranscript(makeTranscript({ duration: null, language: null }));
    const found = getTranscriptById(t.id);
    expect(found?.duration).toBeNull();
    expect(found?.language).toBeNull();
  });
});

describe("getTranscriptById", () => {
  it("returns null for unknown id", () => {
    expect(getTranscriptById("nonexistent")).toBeNull();
  });

  it("returns transcript by id", () => {
    const t = insertTranscript(makeTranscript());
    const found = getTranscriptById(t.id);
    expect(found?.id).toBe(t.id);
  });
});

describe("getTranscripts", () => {
  beforeEach(() => {
    insertTranscript(makeTranscript({ provider: "openai", file: "/tmp/a.mp3" }));
    insertTranscript(makeTranscript({ provider: "grok", file: "/tmp/b.mp3" }));
    insertTranscript(makeTranscript({ provider: "openai", file: "/tmp/c.mp3" }));
  });

  it("returns all transcripts with no filter", () => {
    expect(getTranscripts()).toHaveLength(3);
  });

  it("filters by provider", () => {
    const results = getTranscripts({ provider: "openai" });
    expect(results).toHaveLength(2);
    expect(results.every((t) => t.provider === "openai")).toBe(true);
  });

  it("respects limit", () => {
    expect(getTranscripts({ limit: 2 })).toHaveLength(2);
  });

  it("returns results ordered by created_at desc", () => {
    const results = getTranscripts();
    const dates = results.map((t) => t.createdAt);
    expect(dates).toEqual([...dates].sort().reverse());
  });
});

describe("deleteTranscript", () => {
  it("deletes an existing transcript", () => {
    const t = insertTranscript(makeTranscript());
    expect(deleteTranscript(t.id)).toBe(true);
    expect(getTranscriptById(t.id)).toBeNull();
  });

  it("returns false for unknown id", () => {
    expect(deleteTranscript("nonexistent")).toBe(false);
  });
});
