export type TranscriptFormat = "txt" | "srt" | "json";

export type ProviderName = "openai" | "grok" | "gemini";

export interface Transcript {
  id: string;
  file: string;
  provider: ProviderName;
  format: TranscriptFormat;
  content: string;
  duration: number | null;
  language: string | null;
  createdAt: string;
}

export interface TranscribeOptions {
  provider?: ProviderName;
  format?: TranscriptFormat;
  language?: string;
  out?: string;
}

export interface ListOptions {
  provider?: ProviderName;
  limit?: number;
}

export interface ExportOptions {
  format?: TranscriptFormat;
  out?: string;
}

export interface S2TConfig {
  provider: ProviderName;
  openaiApiKey?: string;
  grokApiKey?: string;
  geminiApiKey?: string;
}
