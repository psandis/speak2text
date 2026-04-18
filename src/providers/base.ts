import type { TranscribeOptions, Transcript } from "../types.js";

export interface TranscriptionProvider {
  transcribe(filePath: string, opts: TranscribeOptions): Promise<Omit<Transcript, "id" | "createdAt">>;
}
