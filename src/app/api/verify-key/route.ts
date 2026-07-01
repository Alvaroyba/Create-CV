import { NextResponse } from 'next/server';
import OpenAI from 'openai';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  let body: { provider: string; apiKey: string; baseUrl?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ valid: false, error: 'Solicitud inválida.' }, { status: 400 });
  }

  const { provider, apiKey, baseUrl } = body;

  if (!provider) {
    return NextResponse.json({ valid: false, error: 'Proveedor faltante.' }, { status: 400 });
  }
  if (provider !== 'local' && !apiKey) {
    return NextResponse.json({ valid: false, error: 'API key faltante.' }, { status: 400 });
  }

  try {
    if (provider === 'local' || provider === 'openai') {
      try {
        const client = new OpenAI({
          apiKey: apiKey || 'dummy-key',
          baseURL: provider === 'local' ? (baseUrl || process.env.OLLAMA_BASE_URL || 'http://localhost:11434/v1') : undefined,
        });
        const response = await client.models.list();
        const models = response.data.map((m: any) => m.id);
        return NextResponse.json({ valid: true, models });
      } catch (err: any) {
        if (err.status === 401) {
          return NextResponse.json({ valid: false, error: 'API key inválida.' });
        }
        return NextResponse.json({ valid: false, error: err?.message || 'No se pudo conectar con el proveedor.' });
      }
    }

    if (provider === 'anthropic') {
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 10,
          messages: [{ role: 'user', content: 'Hi' }],
        }),
      });
      if (res.ok) {
        return NextResponse.json({ valid: true });
      }
      if (res.status === 401) {
        return NextResponse.json({ valid: false, error: 'API key inválida.' });
      }
      return NextResponse.json({ valid: false, error: `Error del proveedor (${res.status}).` });
    }

    if (provider === 'gemini') {
      try {
        const client = new OpenAI({
          apiKey: apiKey,
          baseURL: 'https://generativelanguage.googleapis.com/v1beta/openai/',
        });
        const response = await client.models.list();
        const models = response.data.map((m: any) => m.id);
        return NextResponse.json({ valid: true, models });
      } catch (err: any) {
        if (err.status === 400 || err.status === 401 || err.status === 403) {
          return NextResponse.json({ valid: false, error: 'API key inválida.' });
        }
        return NextResponse.json({ valid: false, error: err?.message || 'Error del proveedor.' });
      }
    }

    return NextResponse.json({ valid: false, error: 'Proveedor no soportado.' }, { status: 400 });
  } catch {
    return NextResponse.json({ valid: false, error: 'No se pudo conectar con el proveedor.' });
  }
}
