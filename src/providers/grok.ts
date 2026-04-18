import { createReadStream } from "node:fs";
import OpenAI from "openai";
import type { TranscribeOptions, Transcript } from "../types.js";
import type { TranscriptionProvider } from "./base.js";

export class GrokProvider implements TranscriptionProvider {
  private client: OpenAI;

  constructor(apiKey: string) {
    this.client = new OpenAI({
      apiKey,
      baseURL: "https://api.x.ai/v1",
    });
  }

  async transcribe(filePath: string, opts: TranscribeOptions): Promise<Omit<Transcript, "id" | "createdAt">> {
    if (opts.translate) throw new Error(`Translation is not supported with the Grok provider. Use --provider openai.`);
    const format = opts.format ?? "txt";

    const response = await this.client.audio.transcriptions.create({
      file: createReadStream(filePath),
      model: "whisper-large-v3",
      response_format: "text",
      ...(opts.language ? { language: opts.language } : {}),
    });

    return {
      file: filePath,
      provider: "grok",
      format,
      content: typeof response === "string" ? response : JSON.stringify(response, null, 2),
      duration: null,
      language: opts.language ?? null,
    };
  }
}
