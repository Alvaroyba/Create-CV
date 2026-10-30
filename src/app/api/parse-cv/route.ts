import { NextResponse } from 'next/server';
import { buildCVExtractionPrompt } from '@/lib/ai-prompt';
import { ApiError, getProviderCaller, callWithRetry } from '@/lib/ai-providers';
import { CVDataSchema } from '@/lib/schemas/cv';
import type { CVData, SectionKey } from '@/lib/schemas/cv';
import { generateId } from '@/lib/utils';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

interface ParseRequest {
  text: string;
  provider: 'opencode' | 'openai' | 'anthropic' | 'gemini' | 'local';
  apiKey: string;
  model: string;
  baseUrl?: string;
}

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

    if (typeof basics.email === 'string') {
      if (!basics.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(basics.email)) delete basics.email;
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
        if (typeof e[dateKey] === 'string') {
          if (!e[dateKey] || !DATE_REGEX.test(e[dateKey] as string)) {
            delete e[dateKey];
          }
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

  const { text, provider, apiKey, model, baseUrl } = body;

  if (!text?.trim()) {
    return NextResponse.json({ error: 'Texto vacío.' }, { status: 400 });
  }
  if (!provider || !model) {
    return NextResponse.json({ error: 'Parámetros faltantes.' }, { status: 400 });
  }
  if (provider !== 'local' && provider !== 'opencode' && !apiKey) {
    return NextResponse.json({ error: 'API key requerida.' }, { status: 400 });
  }
  if (provider !== 'openai' && provider !== 'anthropic' && provider !== 'gemini' && provider !== 'local' && provider !== 'opencode') {
    return NextResponse.json({ error: 'Proveedor no soportado.' }, { status: 400 });
  }

  const { systemPrompt, userPrompt } = buildCVExtractionPrompt(text);

  let rawContent: string;
  try {
    const callProvider = getProviderCaller(provider);
    rawContent = await callWithRetry(callProvider, apiKey, model, systemPrompt, userPrompt, baseUrl);
  } catch (err) {
    if (err instanceof ApiError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    return NextResponse.json(
      { error: 'No se pudo conectar con el servicio de IA. Verifica tu conexión a internet e intenta de nuevo.' },
      { status: 504 },
    );
  }

  console.log('====== RAW CONTENT DESDE EL MODELO (PARSE CV) ======');
  console.log(rawContent);
  console.log('====================================================');

  let parsed: Record<string, unknown>;
  try {
    parsed = JSON.parse(rawContent);
  } catch (parseError) {
    console.error("JSON Parse Error:", parseError, "Raw content:", rawContent);
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

    console.error("Strict parse error:", result.error);
    console.error("Tolerant parse error:", tolerantResult.error);
    console.error("Raw withIds:", JSON.stringify(withIds, null, 2));

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
