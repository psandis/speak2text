import { getApiKey, loadConfig } from "../lib/config.js";
import type { ProviderName } from "../types.js";
import type { TranscriptionProvider } from "./base.js";

export async function getProvider(name?: ProviderName): Promise<TranscriptionProvider> {
  const config = loadConfig();
  const provider = name ?? config.provider;
  const apiKey = getApiKey(provider);

  if (!apiKey) {
    throw new Error(
      `No API key for provider "${provider}". Set it with: s2t config set ${provider}.key YOUR_KEY`,
    );
  }

  switch (provider) {
    case "openai": {
      const { OpenAIProvider } = await import("./openai.js");
      return new OpenAIProvider(apiKey);
    }
    case "grok": {
      const { GrokProvider } = await import("./grok.js");
      return new GrokProvider(apiKey);
    }
    case "gemini": {
      const { GeminiProvider } = await import("./gemini.js");
      return new GeminiProvider(apiKey);
    }
    default:
      throw new Error(`Unknown provider: "${provider}". Supported: openai, grok, gemini`);
  }
}
