export type AIProvider = 'local' | 'openai' | 'anthropic' | 'gemini';

export interface AIConfig {
  provider: AIProvider;
  apiKey: string;
  model: string;
  baseUrl?: string;
}

export const AI_PROVIDERS: Record<AIProvider, { label: string; models: { id: string; label: string }[] }> = {
  local: {
    label: 'Local (Ollama, vLLM, MLX)',
    models: [],
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
    models: [],
  },
};

const AI_CONFIG_KEY = 'headless-cv-ai-config';

export function loadAIConfig(): AIConfig | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(AI_CONFIG_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as AIConfig;
    if (!parsed.provider || !parsed.model) return null;
    if (parsed.provider !== 'local' && !parsed.apiKey) return null;

    // Validate that the saved provider still exists
    const providerInfo = AI_PROVIDERS[parsed.provider];
    if (!providerInfo) return null;

    // Only validate model strictly if the provider has hardcoded models
    const isDynamicModels = providerInfo.models.length === 0;
    if (!isDynamicModels) {
      const modelValid = providerInfo.models.some((m) => m.id === parsed.model);
      if (!modelValid) {
        // Auto-migrate: keep the key but switch to the first available model
        parsed.model = providerInfo.models[0].id;
        saveAIConfig(parsed);
      }
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
