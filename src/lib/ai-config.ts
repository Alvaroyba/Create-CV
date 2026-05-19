export type AIProvider = 'ollama' | 'openai' | 'anthropic' | 'gemini';

export interface AIConfig {
  provider: AIProvider;
  apiKey: string;
  model: string;
}

export const AI_PROVIDERS: Record<AIProvider, { label: string; models: { id: string; label: string }[] }> = {
  ollama: {
    label: 'Ollama (local)',
    models: [
      { id: 'llama3', label: 'Llama 3 8B' },
      { id: 'llama3.1', label: 'Llama 3.1 8B' },
      { id: 'mistral', label: 'Mistral 7B' },
      { id: 'gemma2', label: 'Gemma 2 9B' },
    ],
  },
  openai: {
    label: 'OpenAI',
    models: [
      { id: 'gpt-4o-mini', label: 'GPT-4o Mini (económico)' },
      { id: 'gpt-4o', label: 'GPT-4o' },
    ],
  },
  anthropic: {
    label: 'Anthropic',
    models: [
      { id: 'claude-sonnet-4-20250514', label: 'Claude Sonnet 4 (económico)' },
      { id: 'claude-opus-4-20250514', label: 'Claude Opus 4' },
    ],
  },
  gemini: {
    label: 'Google Gemini',
    models: [
      { id: 'gemini-2.0-flash', label: 'Gemini 2.0 Flash (económico)' },
      { id: 'gemini-2.5-flash', label: 'Gemini 2.5 Flash' },
      { id: 'gemini-2.5-pro', label: 'Gemini 2.5 Pro' },
    ],
  },
};

const AI_CONFIG_KEY = 'headless-cv-ai-config';

export function loadAIConfig(): AIConfig | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(AI_CONFIG_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as AIConfig;
    if (!parsed.provider || !parsed.apiKey || !parsed.model) return null;

    // Validate that the saved provider and model still exist
    const providerInfo = AI_PROVIDERS[parsed.provider];
    if (!providerInfo) return null;

    const modelValid = providerInfo.models.some((m) => m.id === parsed.model);
    if (!modelValid) {
      // Auto-migrate: keep the key but switch to the first available model
      parsed.model = providerInfo.models[0].id;
      saveAIConfig(parsed);
    }

    return parsed;
  } catch {
    return null;
  }
}

export function saveAIConfig(config: AIConfig): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(AI_CONFIG_KEY, JSON.stringify(config));
}

export function clearAIConfig(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(AI_CONFIG_KEY);
}

export function hasAIConfig(): boolean {
  return loadAIConfig() !== null;
}
