import { NextRequest, NextResponse } from 'next/server';
import { GeneratePdfRequestSchema } from '@/lib/schemas/api';
import { generatePdfHTML } from '@/lib/pdf/template';
import { renderPdf, ContentOverflowError, RenderTimeoutError } from '@/lib/pdf/renderer';
import { slugifyFilename } from '@/lib/utils';
import type { CVData, SectionKey } from '@/lib/schemas/cv';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

const MAX_BODY_SIZE = 1_048_576; // 1 MB
const RATE_LIMIT_MAX = 10;
const RATE_LIMIT_WINDOW_MS = 3_600_000; // 1 hora

const rateLimitMap = new Map<string, number[]>();

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const timestamps = rateLimitMap.get(ip) ?? [];
  const recent = timestamps.filter((t) => now - t < RATE_LIMIT_WINDOW_MS);
  rateLimitMap.set(ip, recent);

  if (recent.length >= RATE_LIMIT_MAX) return false;

  recent.push(now);
  rateLimitMap.set(ip, recent);
  return true;
}

function getClientIp(request: NextRequest): string {
  return (
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    request.headers.get('x-real-ip') ??
    '127.0.0.1'
  );
}

function filterActiveEntries(data: CVData): CVData {
  const sectionKeys: SectionKey[] = [
    'work', 'education', 'skills', 'languages',
    'projects', 'certifications', 'volunteer', 'publications',
  ];

  const filtered = { ...data, basics: { ...data.basics } };
  for (const key of sectionKeys) {
    (filtered[key] as Array<{ isActive: boolean }>) = (
      data[key] as Array<{ isActive: boolean }>
    ).filter((e) => e.isActive);
  }
  return filtered;
}

function errorResponse(code: string, message: string, status: number) {
  return NextResponse.json({ error: { code, message } }, { status });
}

export async function POST(request: NextRequest) {
  try {
    const ip = getClientIp(request);
  if (!checkRateLimit(ip)) {
    return errorResponse(
      'RATE_LIMIT',
      'Has excedido el límite de generaciones. Intenta de nuevo más tarde.',
      429,
    );
  }

  let body: unknown;
  try {
    const text = await request.text();
    if (text.length > MAX_BODY_SIZE) {
      return errorResponse('VALIDATION_ERROR', 'El payload excede el tamaño máximo permitido (1 MB).', 400);
    }
    body = JSON.parse(text);
  } catch {
    return errorResponse('VALIDATION_ERROR', 'El body de la petición no es JSON válido.', 400);
  }

  const result = GeneratePdfRequestSchema.safeParse(body);
  if (!result.success) {
    const issue = result.error.issues[0];
    const pathStr = issue?.path.join('.') ?? '';
    const firstError = `${issue?.message ?? 'Datos inválidos'} (Ruta: ${pathStr})`;
    return errorResponse('VALIDATION_ERROR', firstError, 400);
  }

  const { cvData, options } = result.data;
  const filteredData = filterActiveEntries(cvData);
  const html = generatePdfHTML(filteredData, { pageFormat: options.pageSize });

  try {
    const pdfBuffer = await renderPdf(html, {
      singlePage: options.singlePage,
      pageFormat: options.pageSize,
      cvData: filteredData,
    });

    const today = new Date().toISOString().split('T')[0];
    const filename = `CV_${slugifyFilename(filteredData.basics.name)}_${today}.pdf`;

    return new Response(new Uint8Array(pdfBuffer), {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Cache-Control': 'no-store',
      },
    });
  } catch (error) {
    if (error instanceof ContentOverflowError) {
      return errorResponse('CONTENT_OVERFLOW', error.message, 409);
    }
    if (error instanceof RenderTimeoutError) {
      return errorResponse('TIMEOUT_ERROR', error.message, 504);
    }
    console.error('PDF Generation Error:', error);
    const msg = error instanceof Error ? error.message : 'Error desconocido';
    return errorResponse('RENDER_ERROR', `Ocurrió un error inesperado al generar el PDF: ${msg}`, 500);
  }
  } catch (globalError) {
    console.error('Global API Error:', globalError);
    return errorResponse('RENDER_ERROR', 'Ocurrió un error inesperado en el servidor.', 500);
  }
}
