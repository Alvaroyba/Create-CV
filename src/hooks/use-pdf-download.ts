'use client';

import { useState, useCallback, useEffect } from 'react';
import { useCVContext } from '@/providers/cv-provider';
import type { PageFormat } from '@/lib/constants';

interface UsePdfDownloadOptions {
  pageSize?: PageFormat;
  singlePage?: boolean;
  language?: 'es' | 'en';
  templateId?: string;
}

interface UsePdfDownloadReturn {
  download: () => Promise<void>;
  isLoading: boolean;
  error: string | null;
}

const ERROR_MESSAGES: Record<string, string> = {
  VALIDATION_ERROR: 'Los datos contienen un formato inesperado. Revisa los campos del CV.',
  CONTENT_OVERFLOW: 'Tu contenido excede 1 página. Desactiva la opción de página única o reduce el contenido.',
  TIMEOUT_ERROR: 'La generación está tardando demasiado. Intenta de nuevo.',
  RENDER_ERROR: 'Ocurrió un error al generar el PDF. Intenta de nuevo.',
  RATE_LIMIT: 'Has excedido el límite de generaciones. Intenta de nuevo más tarde.',
};

export function usePdfDownload(pdfOptions?: UsePdfDownloadOptions): UsePdfDownloadReturn {
  const { data, validate } = useCVContext();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Clear error when data changes
  useEffect(() => {
    setError(null);
  }, [data]);

  const download = useCallback(async () => {
    if (isLoading) return;

    const validation = validate();
    if (!validation.valid) {
      const firstError = Object.values(validation.errors)[0] ?? 'Datos inválidos';
      setError(firstError);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/generate-pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cvData: data,
          options: {
            templateId: pdfOptions?.templateId ?? 'classic',
            pageSize: pdfOptions?.pageSize ?? 'letter',
            singlePage: pdfOptions?.singlePage ?? false,
            language: pdfOptions?.language ?? 'es',
          },
        }),
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        const filename =
          response.headers.get('Content-Disposition')?.match(/filename="(.+)"/)?.[1] ??
          'cv.pdf';

        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      } else {
        const body = await response.json().catch(() => null);
        const code = body?.error?.code ?? 'RENDER_ERROR';
        if (code === 'VALIDATION_ERROR' && body?.error?.message) {
          setError(body.error.message);
        } else {
          setError(ERROR_MESSAGES[code] ?? ERROR_MESSAGES.RENDER_ERROR);
        }
      }
    } catch {
      setError('Error de conexión. Verifica tu conexión a internet e intenta de nuevo.');
    } finally {
      setIsLoading(false);
    }
  }, [data, validate, isLoading, pdfOptions?.pageSize, pdfOptions?.singlePage, pdfOptions?.language, pdfOptions?.templateId]);

  return { download, isLoading, error };
}
