import { NextResponse } from 'next/server';
import { buildCVExtractionPrompt } from '@/lib/ai-prompt';
import { CVDataSchema } from '@/lib/schemas/cv';
import type { CVData, SectionKey } from '@/lib/schemas/cv';
import { generateId } from '@/lib/utils';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

const MAX_RETRIES = 3;

interface ParseRequest {
  text: string;
  provider: 'openai' | 'anthropic' | 'gemini' | 'ollama';
  apiKey: string;
  model: string;
}

const OLLAMA_BASE_URL = process.env.OLLAMA_BASE_URL || 'http://localhost:11434';

async function callOllama(_apiKey: string, model: string, systemPrompt: string, userPrompt: string): Promise<string> {
  let res: Response;
  try {
    res = await fetch(`${OLLAMA_BASE_URL}/v1/chat/completions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0,
        format: 'json',
      }),
    });
  } catch {
    throw new ApiError(504, 'No se pudo conectar con Ollama. Verifica que esté ejecutándose (ollama serve).');
  }

  if (!res.ok) {
    const status = res.status;
    const body = await res.json().catch(() => ({}));
    const msg: string = body?.error ?? '';
    if (status === 404 || msg.includes('not found')) {
      throw new ApiError(422, `El modelo "${model}" no está disponible en Ollama. Descárgalo con: ollama pull ${model}`);
    }
    if (status >= 500) throw new RetryableError(`Ollama server error: ${status}`);
    throw new ApiError(422, msg || 'Error al comunicarse con Ollama.');
  }

  const data = await res.json();
  return data.choices[0].message.content;
}

async function callOpenAI(apiKey: string, model: string, systemPrompt: string, userPrompt: string): Promise<string> {
  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0,
      response_format: { type: 'json_object' },
    }),
  });

  if (!res.ok) {
    const status = res.status;
    if (status === 401) throw new ApiError(401, 'La API key configurada no es válida o ha expirado.');
    if (status === 429) throw new ApiError(429, 'Tu cuenta de OpenAI ha alcanzado su límite de uso.');
    if (status >= 500) throw new RetryableError(`OpenAI server error: ${status}`);
    throw new ApiError(422, 'Error al comunicarse con OpenAI.');
  }

  const data = await res.json();
  return data.choices[0].message.content;
}

async function callAnthropic(apiKey: string, model: string, systemPrompt: string, userPrompt: string): Promise<string> {
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

async function callGemini(apiKey: string, model: string, systemPrompt: string, userPrompt: string): Promise<string> {
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        system_instruction: { parts: [{ text: systemPrompt }] },
        contents: [{ parts: [{ text: userPrompt }] }],
        generationConfig: {
          temperature: 0,
          responseMimeType: 'application/json',
        },
      }),
    },
  );

  if (!res.ok) {
    const status = res.status;
    const body = await res.json().catch(() => ({}));
    const geminiMsg: string = body?.error?.message ?? '';

    if (status === 400) {
      if (geminiMsg.includes('API_KEY_INVALID') || geminiMsg.includes('API key not valid')) {
        throw new ApiError(401, 'La API key configurada no es válida o ha expirado.');
      }
      if (geminiMsg.includes('not found') || geminiMsg.includes('is not supported')) {
        throw new ApiError(422, `El modelo "${model}" no está disponible. Selecciona otro modelo en la configuración de IA.`);
      }
      // Surface the actual Gemini error for other 400s
      throw new ApiError(422, geminiMsg || 'Error en la solicitud a Google Gemini.');
    }
    if (status === 401 || status === 403) throw new ApiError(401, 'La API key configurada no es válida o ha expirado.');
    if (status === 429) throw new ApiError(429, 'Tu cuenta de Google ha alcanzado su límite de uso.');
    if (status >= 500) throw new RetryableError(`Gemini server error: ${status}`);
    throw new ApiError(422, geminiMsg || 'Error al comunicarse con Google Gemini.');
  }

  const data = await res.json();
  const candidates = data.candidates;
  if (!candidates?.[0]?.content?.parts?.[0]?.text) {
    throw new ApiError(422, 'Gemini no devolvió contenido válido.');
  }
  return candidates[0].content.parts[0].text;
}

class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

class RetryableError extends Error {}

function ensureIdsOnEntries(raw: Record<string, unknown>): Record<string, unknown> {
  const sectionKeys: SectionKey[] = [
    'work', 'education', 'skills', 'languages',
    'projects', 'certifications', 'volunteer', 'publications',
  ];

  const result = { ...raw };
  for (const key of sectionKeys) {
    if (Array.isArray(result[key])) {
      result[key] = (result[key] as Record<string, unknown>[]).map((entry) => ({
        ...entry,
        id: typeof entry.id === 'string' && entry.id.length > 0 ? entry.id : generateId(),
        isActive: typeof entry.isActive === 'boolean' ? entry.isActive : true,
      }));
    }
  }
  return result;
}

const DATE_REGEX = /^\d{4}(-\d{2})?$/;
const DATE_FIELD_KEYS = ['startDate', 'endDate', 'date', 'releaseDate'];
const SECTION_KEYS: SectionKey[] = [
  'work', 'education', 'skills', 'languages',
  'projects', 'certifications', 'volunteer', 'publications',
];

function isValidUrl(str: string): boolean {
  try {
    new URL(str);
    return true;
  } catch {
    return false;
  }
}

/**
 * Cleans up common issues in AI-extracted JSON:
 * - Invalid email addresses → removed
 * - Dates not matching YYYY or YYYY-MM → removed
 * - Invalid URLs → set to ''
 * - Non-string values where strings are expected → removed
 */
function sanitizeAiOutput(raw: Record<string, unknown>): Record<string, unknown> {
  const sanitized = { ...raw };

  if (sanitized.basics && typeof sanitized.basics === 'object') {
    const basics = { ...(sanitized.basics as Record<string, unknown>) };

    if (typeof basics.email === 'string' && basics.email) {
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(basics.email)) delete basics.email;
    }
    if (typeof basics.url === 'string' && basics.url && !isValidUrl(basics.url)) {
      basics.url = '';
    }
    if (Array.isArray(basics.profiles)) {
      basics.profiles = (basics.profiles as Record<string, unknown>[]).map((p) => ({
        ...p,
        url: typeof p.url === 'string' && p.url && !isValidUrl(p.url) ? '' : p.url,
      }));
    }

    sanitized.basics = basics;
  }

  for (const key of SECTION_KEYS) {
    if (!Array.isArray(sanitized[key])) continue;
    sanitized[key] = (sanitized[key] as Record<string, unknown>[]).map((entry) => {
      const e = { ...entry };

      for (const dateKey of DATE_FIELD_KEYS) {
        if (typeof e[dateKey] === 'string' && e[dateKey]) {
          if (!DATE_REGEX.test(e[dateKey] as string)) delete e[dateKey];
        }
      }

      if (typeof e.url === 'string' && e.url && !isValidUrl(e.url)) e.url = '';

      if (Array.isArray(e.highlights)) {
        e.highlights = (e.highlights as unknown[]).filter((h) => typeof h === 'string');
      }
      if (Array.isArray(e.keywords)) {
        e.keywords = (e.keywords as unknown[]).filter((k) => typeof k === 'string');
      }
      if (Array.isArray(e.courses)) {
        e.courses = (e.courses as unknown[]).filter((c) => typeof c === 'string');
      }

      return e;
    });
  }

  return sanitized;
}

function buildSections(data: CVData): Record<string, number | boolean> {
  const sections: Record<string, number | boolean> = {};
  sections.basics = Boolean(data.basics.name);
  const sectionKeys: SectionKey[] = [
    'work', 'education', 'skills', 'languages',
    'projects', 'certifications', 'volunteer', 'publications',
  ];
  for (const key of sectionKeys) {
    sections[key] = data[key].length;
  }
  return sections;
}

function buildWarnings(data: CVData): string[] {
  const warnings: string[] = [];
  const labels: Record<SectionKey, string> = {
    work: 'experiencia laboral',
    education: 'educación',
    skills: 'habilidades',
    languages: 'idiomas',
    projects: 'proyectos',
    certifications: 'certificaciones',
    volunteer: 'voluntariado',
    publications: 'publicaciones',
  };

  for (const [key, label] of Object.entries(labels)) {
    if (data[key as SectionKey].length === 0) {
      warnings.push(`No se detectaron datos de ${label}`);
    }
  }
  return warnings;
}

export async function POST(request: Request) {
  let body: ParseRequest;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Cuerpo de la solicitud inválido.' }, { status: 400 });
  }

  const { text, provider, apiKey, model } = body;

  if (!text?.trim()) {
    return NextResponse.json({ error: 'Texto vacío.' }, { status: 400 });
  }
  if (!provider || !model) {
    return NextResponse.json({ error: 'Parámetros faltantes.' }, { status: 400 });
  }
  if (provider !== 'ollama' && !apiKey) {
    return NextResponse.json({ error: 'API key requerida.' }, { status: 400 });
  }
  if (provider !== 'openai' && provider !== 'anthropic' && provider !== 'gemini' && provider !== 'ollama') {
    return NextResponse.json({ error: 'Proveedor no soportado.' }, { status: 400 });
  }

  const { systemPrompt, userPrompt } = buildCVExtractionPrompt(text);

  const providerMap = { openai: callOpenAI, anthropic: callAnthropic, gemini: callGemini, ollama: callOllama };
  const callProvider = providerMap[provider];

  let rawContent: string | null = null;
  let lastError: Error | null = null;

  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    try {
      rawContent = await callProvider(apiKey, model, systemPrompt, userPrompt);
      break;
    } catch (err) {
      if (err instanceof ApiError) {
        return NextResponse.json({ error: err.message }, { status: err.status });
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
      return NextResponse.json(
        { error: 'No se pudo conectar con el servicio de IA. Verifica tu conexión a internet e intenta de nuevo.' },
        { status: 504 },
      );
    }
    return NextResponse.json({ error: 'Sin respuesta del proveedor.' }, { status: 504 });
  }

  let parsed: Record<string, unknown>;
  try {
    parsed = JSON.parse(rawContent);
  } catch {
    return NextResponse.json(
      { error: 'No se pudieron extraer datos estructurados de tu CV. Intenta con un PDF con formato más convencional.' },
      { status: 422 },
    );
  }

  const sanitized = sanitizeAiOutput(parsed);
  const withIds = ensureIdsOnEntries(sanitized);
  const result = CVDataSchema.safeParse(withIds);

  if (!result.success) {
    // Tolerant: merge with safe defaults and try again
    const base = CVDataSchema.safeParse({ basics: {} });
    if (!base.success) {
      return NextResponse.json(
        { error: 'No se pudieron procesar los datos extraídos.' },
        { status: 422 },
      );
    }

    const tolerantResult = CVDataSchema.safeParse({ ...base.data, ...withIds });
    if (tolerantResult.success) {
      const warnings = buildWarnings(tolerantResult.data);
      warnings.push('Algunos datos pueden no haberse extraído correctamente. Revisa y completa manualmente.');
      return NextResponse.json({
        data: tolerantResult.data,
        sections: buildSections(tolerantResult.data),
        warnings,
      });
    }

    return NextResponse.json(
      { error: 'No se pudieron extraer datos estructurados de tu CV.' },
      { status: 422 },
    );
  }

  const warnings = buildWarnings(result.data);
  return NextResponse.json({
    data: result.data,
    sections: buildSections(result.data),
    warnings,
  });
}
