import { createReadStream } from "node:fs";
import OpenAI from "openai";
import type { TranscribeOptions, Transcript } from "../types.js";
import type { TranscriptionProvider } from "./base.js";

export class GeminiProvider implements TranscriptionProvider {
  private client: OpenAI;

  constructor(apiKey: string) {
    this.client = new OpenAI({
      apiKey,
      baseURL: "https://generativelanguage.googleapis.com/v1beta/openai/",
    });
  }

  async transcribe(filePath: string, opts: TranscribeOptions): Promise<Omit<Transcript, "id" | "createdAt">> {
    if (opts.translate) throw new Error(`Translation is not supported with the Gemini provider. Use --provider openai.`);
    const format = opts.format ?? "txt";

    const response = await this.client.audio.transcriptions.create({
      file: createReadStream(filePath),
      model: "gemini-2.0-flash",
      response_format: "text",
      ...(opts.language ? { language: opts.language } : {}),
    });

    return {
      file: filePath,
      provider: "gemini",
      format,
      content: typeof response === "string" ? response : JSON.stringify(response, null, 2),
      duration: null,
      language: opts.language ?? null,
    };
  }
}
