import { createReadStream } from "node:fs";
import OpenAI from "openai";
import type { TranscribeOptions, Transcript } from "../types.js";
import type { TranscriptionProvider } from "./base.js";

export class OpenAIProvider implements TranscriptionProvider {
  private client: OpenAI;

  constructor(apiKey: string) {
    this.client = new OpenAI({ apiKey });
  }

  async transcribe(filePath: string, opts: TranscribeOptions): Promise<Omit<Transcript, "id" | "createdAt">> {
    const format = opts.format ?? "txt";

    const apiFormat = format === "txt" ? "text" : format === "json" ? "verbose_json" : "srt";

    const response = await this.client.audio.transcriptions.create({
      file: createReadStream(filePath),
      model: "whisper-1",
      response_format: apiFormat as "text" | "verbose_json" | "srt",
      ...(opts.language ? { language: opts.language } : {}),
    });

    const content = typeof response === "string" ? response : JSON.stringify(response, null, 2);
    const duration = typeof response === "object" && "duration" in response
      ? (response as { duration: number }).duration
      : null;
    const language = typeof response === "object" && "language" in response
      ? (response as { language: string }).language
      : opts.language ?? null;

    return {
      file: filePath,
      provider: "openai",
      format,
      content,
      duration,
      language,
    };
  }
}
