import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  let body: { provider: string; apiKey: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ valid: false, error: 'Solicitud inválida.' }, { status: 400 });
  }

  const { provider, apiKey } = body;

  if (!provider || !apiKey) {
    return NextResponse.json({ valid: false, error: 'Parámetros faltantes.' }, { status: 400 });
  }

  try {
    if (provider === 'ollama') {
      const baseUrl = process.env.OLLAMA_BASE_URL || 'http://localhost:11434';
      let res: Response;
      try {
        res = await fetch(`${baseUrl}/api/tags`);
      } catch {
        return NextResponse.json({ valid: false, error: 'No se pudo conectar con Ollama. Verifica que esté ejecutándose (ollama serve).' });
      }
      if (res.ok) {
        return NextResponse.json({ valid: true });
      }
      return NextResponse.json({ valid: false, error: 'Ollama no respondió correctamente.' });
    }

    if (provider === 'openai') {
      const res = await fetch('https://api.openai.com/v1/models', {
        headers: { Authorization: `Bearer ${apiKey}` },
      });
      if (res.ok) {
        return NextResponse.json({ valid: true });
      }
      if (res.status === 401) {
        return NextResponse.json({ valid: false, error: 'API key inválida.' });
      }
      return NextResponse.json({ valid: false, error: `Error del proveedor (${res.status}).` });
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
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`,
      );
      if (res.ok) {
        return NextResponse.json({ valid: true });
      }
      if (res.status === 400 || res.status === 401 || res.status === 403) {
        return NextResponse.json({ valid: false, error: 'API key inválida.' });
      }
      return NextResponse.json({ valid: false, error: `Error del proveedor (${res.status}).` });
    }

    return NextResponse.json({ valid: false, error: 'Proveedor no soportado.' }, { status: 400 });
  } catch {
    return NextResponse.json({ valid: false, error: 'No se pudo conectar con el proveedor.' });
  }
}
