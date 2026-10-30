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

export type AIProvider = 'opencode' | 'openai' | 'anthropic' | 'gemini' | 'local';

const OPENCODE_DEFAULT_BASE_URL = 'http://127.0.0.1:4096';
const LOOPBACK_HOSTS = new Set(['127.0.0.1', 'localhost', '::1', '[::1]']);

let serverStarting: Promise<boolean> | null = null;

async function isOpenCodeHealthy(base: string): Promise<boolean> {
  try {
    const res = await fetch(`${base}/global/health`, { signal: AbortSignal.timeout(2_000) });
    if (!res.ok) return false;
    const data = await res.json();
    return Boolean(data?.healthy);
  } catch {
    return false;
  }
}

/**
 * Starts a local `opencode serve` process if the server is not already
 * running. Only loopback URLs are auto-started for safety.
 */
export async function ensureOpenCodeServer(baseUrl?: string): Promise<string> {
  const raw = (baseUrl || process.env.OPENCODE_SERVER_URL || OPENCODE_DEFAULT_BASE_URL).trim();

  let parsed: URL;
  try {
    parsed = new URL(raw);
  } catch {
    throw new ApiError(503, `La URL de OpenCode no es válida: ${raw}`);
  }

  if (LOOPBACK_HOSTS.has(parsed.hostname)) {
    if (!parsed.port) parsed.port = '4096';
    if (parsed.pathname === '/v1' || parsed.pathname === '/v1/') parsed.pathname = '/';
  }

  const base = parsed.toString().replace(/\/+$/, '');

  if (await isOpenCodeHealthy(base)) return base;

  if (!LOOPBACK_HOSTS.has(parsed.hostname)) {
    throw new ApiError(
      503,
      `No se pudo conectar con OpenCode en ${base}. Verifica que el servidor esté activo.`,
    );
  }

  const port = parsed.port;

  if (!serverStarting) {
    serverStarting = (async () => {
      try {
        const { spawn } = await import('node:child_process');
        const child = spawn('opencode', ['serve', '--port', port], {
          cwd: process.cwd(),
          detached: true,
          stdio: 'ignore',
          shell: true,
          windowsHide: true,
        });
        child.unref();
      } catch {
        return false;
      }

      for (let attempt = 0; attempt < 40; attempt++) {
        await new Promise((resolve) => setTimeout(resolve, 500));
        if (await isOpenCodeHealthy(base)) return true;
      }
      return false;
    })().finally(() => {
      serverStarting = null;
    });
  }

  const started = await serverStarting;
  if (!started) {
    throw new ApiError(
      503,
      'No se pudo iniciar OpenCode automáticamente. Verifica que "opencode" esté instalado y ejecuta "opencode serve --port 4096" manualmente.',
    );
  }

  return base;
}

/**
 * Calls the free models through a local OpenCode server (`opencode serve`).
 * The free tier cannot be used directly with an API key from third-party
 * clients, so we proxy the request through OpenCode itself.
 */
export async function callOpenCodeServer(
  baseUrl: string | undefined,
  model: string,
  systemPrompt: string,
  userPrompt: string,
): Promise<string> {
  const base = await ensureOpenCodeServer(baseUrl);

  let sessionId = '';
  try {
    const res = await fetch(`${base}/session`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: 'CV IA' }),
      signal: AbortSignal.timeout(15_000),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const session = await res.json();
    sessionId = session.id;
    if (!sessionId) throw new Error('Sesión sin id');
  } catch {
    throw new ApiError(
      503,
      `No se pudo conectar con OpenCode en ${base}. Verifica que el servidor esté activo e intenta de nuevo.`,
    );
  }

  try {
    const res = await fetch(`${base}/session/${sessionId}/message`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: { providerID: 'opencode', modelID: model },
        agent: 'plan',
        tools: { write: false, edit: false, bash: false, apply_patch: false },
        system: systemPrompt,
        parts: [{ type: 'text', text: userPrompt }],
      }),
      signal: AbortSignal.timeout(80_000),
    });

    if (!res.ok) {
      if (res.status === 401 || res.status === 403) {
        throw new ApiError(403, 'OpenCode rechazó la solicitud. Verifica que el modelo elegido sea uno de los gratuitos.');
      }
      if (res.status === 404) {
        throw new ApiError(422, `El modelo "${model}" no está disponible en OpenCode.`);
      }
      throw new ApiError(502, `OpenCode respondió con un error (${res.status}).`);
    }

    const data = await res.json();
    const error = data?.info?.error;
    if (error) {
      const message: string = error?.data?.message || 'OpenCode no pudo completar la solicitud.';
      const status: number | undefined = error?.data?.statusCode;
      if (status === 401 || status === 403) {
        throw new ApiError(403, message);
      }
      if (status === 404) {
        throw new ApiError(422, `El modelo "${model}" no está disponible en OpenCode.`);
      }
      throw new ApiError(502, message);
    }

    const parts: { type?: string; text?: string; synthetic?: boolean; ignored?: boolean }[] =
      Array.isArray(data?.parts) ? data.parts : [];
    const text = parts
      .filter((part) => part.type === 'text' && !part.synthetic && !part.ignored)
      .map((part) => part.text || '')
      .join('')
      .trim();

    if (!text) {
      throw new ApiError(502, 'OpenCode no devolvió contenido. Intenta de nuevo.');
    }

    return text;
  } catch (err) {
    if (err instanceof ApiError) throw err;
    if (err instanceof Error && err.name === 'TimeoutError') {
      throw new ApiError(504, 'OpenCode tardó demasiado en responder. Intenta de nuevo.');
    }
    throw new ApiError(502, 'Error al comunicarse con OpenCode.');
  } finally {
    fetch(`${base}/session/${sessionId}`, { method: 'DELETE' }).catch(() => {});
  }
}

export function getProviderCaller(provider: AIProvider): (key: string, mod: string, sys: string, usr: string, base?: string) => Promise<string> {
  if (provider === 'opencode') {
    return (_key, mod, sys, usr, base) => callOpenCodeServer(base, mod, sys, usr);
  }
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
