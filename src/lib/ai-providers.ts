import OpenAI from 'openai';

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

export class RetryableError extends Error {}

const MAX_RETRIES = 3;

export async function callOpenAICompatible(
  provider: 'openai' | 'local' | 'gemini',
  apiKey: string,
  model: string,
  systemPrompt: string,
  userPrompt: string,
  baseUrl?: string,
): Promise<string> {
  let finalBaseUrl = undefined;
  if (provider === 'local') {
    finalBaseUrl = baseUrl || process.env.OLLAMA_BASE_URL || 'http://localhost:11434/v1';
  } else if (provider === 'gemini') {
    finalBaseUrl = 'https://generativelanguage.googleapis.com/v1beta/openai/';
  }

  const client = new OpenAI({
    apiKey: apiKey || 'dummy-key',
    baseURL: finalBaseUrl,
  });

  try {
    const res = await client.chat.completions.create({
      model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0,
      max_tokens: 4096,
      ...(provider === 'openai' || provider === 'gemini' ? { response_format: { type: 'json_object' } } : {}),
    });

    return res.choices[0].message.content || '';
  } catch (err: any) {
    const status = err.status || 500;
    const msg = err.message || 'Error al comunicarse con el proveedor.';

    if (status === 401) throw new ApiError(401, 'La API key configurada no es válida o ha expirado.');
    if (status === 429) throw new ApiError(429, 'Se ha alcanzado el límite de uso del proveedor.');
    if (status === 404 || msg.toLowerCase().includes('not found')) throw new ApiError(422, `El modelo "${model}" no está disponible en el endpoint.`);
    if (status >= 500) throw new RetryableError(`Server error: ${status}`);

    throw new ApiError(422, msg);
  }
}

export async function callAnthropic(
  apiKey: string,
  model: string,
  systemPrompt: string,
  userPrompt: string,
): Promise<string> {
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model,
      max_tokens: 4096,
      system: systemPrompt,
      messages: [{ role: 'user', content: userPrompt }],
    }),
  });

  if (!res.ok) {
    const status = res.status;
    if (status === 401) throw new ApiError(401, 'La API key configurada no es válida o ha expirado.');
    if (status === 429) throw new ApiError(429, 'Tu cuenta de Anthropic ha alcanzado su límite de uso.');
    if (status >= 500) throw new RetryableError(`Anthropic server error: ${status}`);
    throw new ApiError(422, 'Error al comunicarse con Anthropic.');
  }

  const data = await res.json();
  return data.content[0].text;
}

export type AIProvider = 'openai' | 'anthropic' | 'gemini' | 'local';

export function getProviderCaller(provider: AIProvider): (key: string, mod: string, sys: string, usr: string, base?: string) => Promise<string> {
  if (provider === 'local' || provider === 'openai' || provider === 'gemini') {
    return (key, mod, sys, usr, base) => callOpenAICompatible(provider, key, mod, sys, usr, base);
  }
  if (provider === 'anthropic') {
    return callAnthropic;
  }
  throw new ApiError(400, 'Proveedor no soportado.');
}

/**
 * Calls the AI provider with automatic retry logic for transient errors.
 */
export async function callWithRetry(
  callProvider: (key: string, mod: string, sys: string, usr: string, base?: string) => Promise<string>,
  apiKey: string,
  model: string,
  systemPrompt: string,
  userPrompt: string,
  baseUrl?: string,
): Promise<string> {
  let rawContent: string | null = null;
  let lastError: Error | null = null;

  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    try {
      rawContent = await callProvider(apiKey, model, systemPrompt, userPrompt, baseUrl);
      break;
    } catch (err) {
      if (err instanceof ApiError) {
        throw err;
      }
      lastError = err as Error;
      if (!(err instanceof RetryableError)) break;
      if (attempt < MAX_RETRIES - 1) {
        await new Promise((r) => setTimeout(r, 1000 * (attempt + 1)));
      }
    }
  }

  if (!rawContent) {
    if (lastError) {
      throw new ApiError(504, 'No se pudo conectar con el servicio de IA. Verifica tu conexión a internet e intenta de nuevo.');
    }
    throw new ApiError(504, 'Sin respuesta del proveedor.');
  }

  return rawContent;
}
