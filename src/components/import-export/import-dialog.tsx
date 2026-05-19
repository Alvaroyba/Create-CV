'use client';

import { useState, useRef, useCallback } from 'react';
import { Modal } from '@/components/ui/modal';
import { useCVContext } from '@/providers/cv-provider';
import { hasExistingData } from '@/lib/storage';
import { CVDataSchema } from '@/lib/schemas/cv';
import type { CVData, SectionKey } from '@/lib/schemas/cv';
import { generateId } from '@/lib/utils';

const MAX_FILE_SIZE = 1_048_576; // 1 MB

type ImportStep = 'idle' | 'preview' | 'confirm-replace' | 'success' | 'error';

interface ImportSummary {
  data: CVData;
  counts: Record<string, number>;
  warnings: string[];
}

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

function normalizeUrl(value: unknown): string | undefined {
  if (value === undefined || value === null || value === '') return undefined;
  if (typeof value !== 'string') return undefined;
  const trimmed = value.trim();
  if (!trimmed) return undefined;
  // Si ya tiene protocolo, retornar tal cual
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) return trimmed;
  // Si parece un dominio, auto-completar con https://
  if (trimmed.includes('.')) {
    const withProtocol = `https://${trimmed}`;
    try {
      new URL(withProtocol);
      return withProtocol;
    } catch {
      return undefined; // URL irreparable
    }
  }
  return undefined; // No es un dominio reconocible
}

function sanitizeUrlFields(obj: Record<string, unknown>, urlKeys: string[]): { warnings: string[] } {
  const warnings: string[] = [];
  for (const key of urlKeys) {
    if (key in obj) {
      const original = obj[key];
      const normalized = normalizeUrl(original);
      if (original && original !== '' && !normalized) {
        warnings.push(`Campo "${key}" con valor "${String(original).slice(0, 50)}" fue omitido (URL inválida).`);
      }
      obj[key] = normalized ?? '';
    }
  }
  return { warnings };
}

function ensureIds(entries: unknown[]): { entries: unknown[]; warnings: string[] } {
  const allWarnings: string[] = [];
  const processed = entries.map((entry) => {
    if (typeof entry !== 'object' || entry === null) return entry;
    const obj = { ...(entry as Record<string, unknown>) };
    obj.id = typeof obj.id === 'string' && obj.id.length > 0 ? obj.id : generateId();
    obj.isActive = typeof obj.isActive === 'boolean' ? obj.isActive : true;
    // Sanitizar URL fields en entries que los tienen
    const { warnings } = sanitizeUrlFields(obj, ['url']);
    allWarnings.push(...warnings);
    return obj;
  });
  return { entries: processed, warnings: allWarnings };
}

function prepareImportData(raw: Record<string, unknown>): { data: Record<string, unknown>; warnings: string[] } {
  const sectionKeys: SectionKey[] = [
    'work', 'education', 'skills', 'languages',
    'projects', 'certifications', 'volunteer', 'publications',
  ];

  const prepared: Record<string, unknown> = { ...raw };
  const allWarnings: string[] = [];

  // Sanitizar URLs en basics
  if (typeof prepared.basics === 'object' && prepared.basics !== null) {
    prepared.basics = { ...(prepared.basics as Record<string, unknown>) };
    const basics = prepared.basics as Record<string, unknown>;
    const { warnings } = sanitizeUrlFields(basics, ['url']);
    allWarnings.push(...warnings);
    // Sanitizar URLs en profiles
    if (Array.isArray(basics.profiles)) {
      basics.profiles = basics.profiles.map((p: unknown) => {
        if (typeof p !== 'object' || p === null) return p;
        const profile = { ...(p as Record<string, unknown>) };
        const { warnings: pw } = sanitizeUrlFields(profile, ['url']);
        allWarnings.push(...pw);
        return profile;
      });
    }
  }

  for (const key of sectionKeys) {
    if (Array.isArray(prepared[key])) {
      const { entries, warnings } = ensureIds(prepared[key] as unknown[]);
      prepared[key] = entries;
      allWarnings.push(...warnings);
    }
  }

  return { data: prepared, warnings: allWarnings };
}

function buildSummary(data: CVData): Record<string, number> {
  const counts: Record<string, number> = {};
  const sectionKeys = Object.keys(SECTION_LABELS) as SectionKey[];

  for (const key of sectionKeys) {
    const arr = data[key];
    if (arr.length > 0) {
      counts[key] = arr.length;
    }
  }

  return counts;
}

interface ImportDialogProps {
  open: boolean;
  onClose: () => void;
}

export function ImportDialog({ open, onClose }: ImportDialogProps) {
  const { replaceAll } = useCVContext();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [step, setStep] = useState<ImportStep>('idle');
  const [error, setError] = useState('');
  const [summary, setSummary] = useState<ImportSummary | null>(null);

  const reset = useCallback(() => {
    setStep('idle');
    setError('');
    setSummary(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  }, []);

  const handleClose = useCallback(() => {
    reset();
    onClose();
  }, [reset, onClose]);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > MAX_FILE_SIZE) {
      setError('El archivo excede el tamaño máximo de 1 MB.');
      setStep('error');
      return;
    }

    if (!file.name.endsWith('.json')) {
      setError('El archivo debe tener extensión .json.');
      setStep('error');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      try {
        const text = reader.result as string;
        const parsed = JSON.parse(text);

        if (Array.isArray(parsed)) {
          setError('El archivo contiene un array. Se espera un objeto JSON {...}.');
          setStep('error');
          return;
        }

        if (typeof parsed !== 'object' || parsed === null) {
          setError('El archivo no contiene un objeto JSON válido.');
          setStep('error');
          return;
        }

        const { data: prepared, warnings: urlWarnings } = prepareImportData(parsed);
        const result = CVDataSchema.safeParse(prepared);

        if (!result.success) {
          const hasAnyData = Object.keys(prepared).some(
            (k) => k === 'basics' || (Array.isArray(prepared[k]) && (prepared[k] as unknown[]).length > 0),
          );

          if (!hasAnyData) {
            setError('El archivo no contiene datos de CV reconocibles.');
          } else {
            const issues = result.error.issues.slice(0, 3);
            const details = issues.map((i) => `${i.path.join('.')}: ${i.message}`).join('\n');
            setError(`Datos inválidos:\n${details}`);
          }
          setStep('error');
          return;
        }

        const counts = buildSummary(result.data);

        if (Object.keys(counts).length === 0 && !result.data.basics.name) {
          setError('El archivo no contiene datos de CV reconocibles.');
          setStep('error');
          return;
        }

        setSummary({ data: result.data, counts, warnings: urlWarnings });
        setStep('preview');
      } catch {
        setError('El archivo no contiene JSON válido. Verifica el formato.');
        setStep('error');
      }
    };

    reader.onerror = () => {
      setError('No se pudo leer el archivo.');
      setStep('error');
    };

    reader.readAsText(file);
  }, []);

  const handleImport = useCallback(() => {
    if (!summary) return;

    if (hasExistingData()) {
      setStep('confirm-replace');
      return;
    }

    replaceAll(summary.data);
    setStep('success');
  }, [summary, replaceAll]);

  const handleConfirmReplace = useCallback(() => {
    if (!summary) return;
    replaceAll(summary.data);
    setStep('success');
  }, [summary, replaceAll]);

  if (step === 'success') {
    return (
      <Modal open={open} onClose={handleClose} title="Importación exitosa" cancelLabel="Cerrar">
        <p>Los datos del CV han sido importados correctamente.</p>
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
          Ya tienes datos en el editor. Importar este archivo reemplazará <strong>todos</strong> los
          datos actuales. Esta acción no se puede deshacer.
        </p>
      </Modal>
    );
  }

  if (step === 'preview' && summary) {
    return (
      <Modal
        open={open}
        onClose={handleClose}
        onConfirm={handleImport}
        title="Resumen de importación"
        confirmLabel="Importar"
      >
        <div className="space-y-2">
          {summary.data.basics.name && (
            <p>
              <strong>Nombre:</strong> {summary.data.basics.name}
            </p>
          )}
          {Object.entries(summary.counts).map(([key, count]) => (
            <p key={key}>
              {SECTION_LABELS[key as SectionKey]}: <strong>{count}</strong>
            </p>
          ))}
          {Object.keys(summary.counts).length === 0 && (
            <p className="text-gray-500">Solo se encontraron datos personales básicos.</p>
          )}
          {summary.warnings.length > 0 && (
            <div className="mt-3 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
              <p className="text-sm font-medium text-yellow-800 mb-1">Aviso</p>
              <p className="text-xs text-yellow-700">
                Algunos campos de URL fueron omitidos o auto-corregidos por tener formato inválido.
              </p>
            </div>
          )}
        </div>
      </Modal>
    );
  }

  // idle
  return (
    <Modal open={open} onClose={handleClose} title="Importar JSON">
      <div className="space-y-4">
        <p className="text-sm text-gray-500">
          Selecciona un archivo JSON con formato compatible (JSON Resume). Máximo 1 MB.
        </p>
        <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-colors">
          <svg className="w-8 h-8 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
          </svg>
          <span className="text-sm text-gray-600">Seleccionar archivo .json</span>
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            className="hidden"
            onChange={handleFileSelect}
          />
        </label>
      </div>
    </Modal>
  );
}
