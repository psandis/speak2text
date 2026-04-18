import { createReadStream } from "node:fs";
import OpenAI from "openai";
import { languageName } from "../lib/languages.js";
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

    const audioParams = {
      file: createReadStream(filePath),
      model: "whisper-1",
      response_format: apiFormat as "text" | "verbose_json" | "srt",
      ...(opts.language ? { language: opts.language } : {}),
    };

    if (opts.translate === "en") {
      const response = await this.client.audio.translations.create(audioParams);
      const content = typeof response === "string" ? response : JSON.stringify(response, null, 2);
      const duration = typeof response === "object" && "duration" in response
        ? (response as { duration: number }).duration : null;
      return { file: filePath, provider: "openai", format, content, duration, language: "en" };
    }

    const response = await this.client.audio.transcriptions.create(audioParams);
    const transcribed = typeof response === "string" ? response : JSON.stringify(response, null, 2);
    const duration = typeof response === "object" && "duration" in response
      ? (response as { duration: number }).duration : null;
    const detectedLanguage = typeof response === "object" && "language" in response
      ? (response as { language: string }).language : opts.language ?? null;

    if (!opts.translate) {
      return { file: filePath, provider: "openai", format, content: transcribed, duration, language: detectedLanguage };
    }

    const targetName = languageName(opts.translate);
    const translated = await this.client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: `Translate the following text to ${targetName}. Return only the translated text.` },
        { role: "user", content: transcribed },
      ],
    });

    const content = translated.choices[0]?.message.content ?? transcribed;
    return { file: filePath, provider: "openai", format, content, duration, language: opts.translate };
  }
}
