'use client';

import { useState, useRef, useCallback } from 'react';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { useCVContext } from '@/providers/cv-provider';
import { hasExistingData } from '@/lib/storage';
import { loadAIConfig, hasAIConfig } from '@/lib/ai-config';
import { extractTextFromPdf } from '@/lib/pdf-extractor';
import type { CVData, SectionKey } from '@/lib/schemas/cv';

const MAX_PDF_SIZE = 5 * 1024 * 1024; // 5 MB

type PdfImportStep =
  | 'idle'
  | 'check-key'
  | 'extracting'
  | 'parsing'
  | 'preview'
  | 'confirm-replace'
  | 'success'
  | 'error';

const SECTION_LABELS: Record<SectionKey, string> = {
  work: 'Experiencias laborales',
  education: 'Educaciones',
  skills: 'Habilidades',
  languages: 'Idiomas',
  projects: 'Proyectos',
  certifications: 'Certificaciones',
  volunteer: 'Voluntariados',
  publications: 'Publicaciones',
};

interface ParseResult {
  data: CVData;
  sections: Record<string, number | boolean>;
  warnings: string[];
}

interface PdfImportDialogProps {
  open: boolean;
  onClose: () => void;
  onOpenSettings: () => void;
}

export function PdfImportDialog({ open, onClose, onOpenSettings }: PdfImportDialogProps) {
  const { replaceAll } = useCVContext();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [step, setStep] = useState<PdfImportStep>('idle');
  const [error, setError] = useState('');
  const [result, setResult] = useState<ParseResult | null>(null);

  const reset = useCallback(() => {
    setStep('idle');
    setError('');
    setResult(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  }, []);

  const handleClose = useCallback(() => {
    reset();
    onClose();
  }, [reset, onClose]);

  const processFile = useCallback(async (file: File) => {
    const config = loadAIConfig();
    if (!config) {
      setStep('check-key');
      return;
    }

    setStep('extracting');
    let text: string;
    try {
      text = await extractTextFromPdf(file);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al extraer texto del PDF.');
      setStep('error');
      return;
    }

    setStep('parsing');
    try {
      const res = await fetch('/api/parse-cv', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text,
          provider: config.provider,
          apiKey: config.apiKey,
          model: config.model,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({ error: 'Error desconocido.' }));
        setError(data.error ?? 'Error al procesar el CV.');
        setStep('error');
        return;
      }

      const data: ParseResult = await res.json();
      setResult(data);
      setStep('preview');
    } catch {
      setError('No se pudo conectar con el servicio de IA. Verifica tu conexión a internet e intenta de nuevo.');
      setStep('error');
    }
  }, []);

  const handleFileSelect = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.toLowerCase().endsWith('.pdf')) {
      setError('Solo se aceptan archivos en formato PDF (.pdf).');
      setStep('error');
      return;
    }

    if (file.size > MAX_PDF_SIZE) {
      setError('El archivo es demasiado grande (máximo 5 MB). Intenta con un PDF más liviano.');
      setStep('error');
      return;
    }

    if (!hasAIConfig()) {
      setStep('check-key');
      return;
    }

    await processFile(file);
  }, [processFile]);

  const handleImport = useCallback(() => {
    if (!result) return;
    if (hasExistingData()) {
      setStep('confirm-replace');
      return;
    }
    replaceAll(result.data);
    setStep('success');
  }, [result, replaceAll]);

  const handleConfirmReplace = useCallback(() => {
    if (!result) return;
    replaceAll(result.data);
    setStep('success');
  }, [result, replaceAll]);

  if (step === 'check-key') {
    return (
      <Modal open={open} onClose={handleClose} title="API key requerida">
        <div className="space-y-3">
          <p className="text-sm text-gray-600">
            Para extraer datos de tu PDF necesitas configurar una API key de un proveedor de IA.
          </p>
          <Button
            variant="primary"
            size="sm"
            onClick={() => { handleClose(); onOpenSettings(); }}
          >
            Configurar API key
          </Button>
        </div>
      </Modal>
    );
  }

  if (step === 'extracting') {
    return (
      <Modal open={open} onClose={handleClose} title="Importar desde PDF">
        <div className="flex flex-col items-center gap-3 py-4">
          <svg className="animate-spin h-8 w-8 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" aria-hidden="true">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          <p className="text-sm text-gray-600">Extrayendo texto del PDF...</p>
        </div>
      </Modal>
    );
  }

  if (step === 'parsing') {
    return (
      <Modal open={open} onClose={handleClose} title="Importar desde PDF">
        <div className="flex flex-col items-center gap-3 py-4">
          <svg className="animate-spin h-8 w-8 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" aria-hidden="true">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          <p className="text-sm text-gray-600">Analizando tu CV... Esto puede tardar unos segundos.</p>
        </div>
      </Modal>
    );
  }

  if (step === 'preview' && result) {
    return (
      <Modal
        open={open}
        onClose={handleClose}
        onConfirm={handleImport}
        title="Datos extraídos del PDF"
        confirmLabel="Cargar datos"
      >
        <div className="space-y-2">
          {result.data.basics.name && (
            <p><strong>Nombre:</strong> {result.data.basics.name}</p>
          )}
          {(Object.keys(SECTION_LABELS) as SectionKey[]).map((key) => {
            const count = result.data[key].length;
            if (count === 0) return null;
            return (
              <p key={key}>{SECTION_LABELS[key]}: <strong>{count}</strong></p>
            );
          })}
          {result.warnings.length > 0 && (
            <div className="mt-3 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
              <p className="text-sm font-medium text-yellow-800 mb-1">Avisos</p>
              {result.warnings.map((w, i) => (
                <p key={i} className="text-xs text-yellow-700">{w}</p>
              ))}
            </div>
          )}
        </div>
      </Modal>
    );
  }

  if (step === 'confirm-replace') {
    return (
      <Modal
        open={open}
        onClose={handleClose}
        onConfirm={handleConfirmReplace}
        title="Reemplazar datos existentes"
        confirmLabel="Reemplazar"
        variant="danger"
      >
        <p>
          Ya tienes datos en el editor. Importar estos datos reemplazará <strong>todos</strong> los
          datos actuales. Esta acción no se puede deshacer.
        </p>
      </Modal>
    );
  }

  if (step === 'success') {
    return (
      <Modal open={open} onClose={handleClose} title="Importación exitosa" cancelLabel="Cerrar">
        <p>Datos extraídos correctamente. Revisa cada sección para verificar la información.</p>
      </Modal>
    );
  }

  if (step === 'error') {
    return (
      <Modal
        open={open}
        onClose={handleClose}
        onConfirm={reset}
        title="Error al importar"
        confirmLabel="Intentar de nuevo"
        cancelLabel="Cancelar"
      >
        <p className="whitespace-pre-line text-red-600">{error}</p>
      </Modal>
    );
  }

  // idle
  return (
    <Modal open={open} onClose={handleClose} title="Importar desde PDF">
      <div className="space-y-4">
        <p className="text-sm text-gray-500">
          Selecciona un archivo PDF de tu CV. Se usará IA para extraer los datos automáticamente. Máximo 5 MB.
        </p>
        <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-colors">
          <svg className="w-8 h-8 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
          </svg>
          <span className="text-sm text-gray-600">Seleccionar archivo .pdf</span>
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf"
            className="hidden"
            onChange={handleFileSelect}
          />
        </label>
      </div>
    </Modal>
  );
}
