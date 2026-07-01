'use client';

import { useState, useCallback } from 'react';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { useCVContext } from '@/providers/cv-provider';
import { hasExistingData } from '@/lib/storage';
import { loadAIConfig, hasAIConfig } from '@/lib/ai-config';
import type { CVData, SectionKey } from '@/lib/schemas/cv';

const LONG_OFFER_THRESHOLD = 10_000;

type TailorStep =
  | 'idle'
  | 'check-key'
  | 'processing'
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

interface TailorResult {
  data: CVData;
  mode: 'tailored' | 'generated';
  warnings: string[];
}

interface TailorDialogProps {
  open: boolean;
  onClose: () => void;
  onOpenSettings: () => void;
}

export function TailorDialog({ open, onClose, onOpenSettings }: TailorDialogProps) {
  const { data: currentCVData, replaceAll } = useCVContext();

  const [step, setStep] = useState<TailorStep>('idle');
  const [jobOffer, setJobOffer] = useState('');
  const [error, setError] = useState('');
  const [result, setResult] = useState<TailorResult | null>(null);

  const reset = useCallback(() => {
    setStep('idle');
    setJobOffer('');
    setError('');
    setResult(null);
  }, []);

  const handleClose = useCallback(() => {
    reset();
    onClose();
  }, [reset, onClose]);

  const hasCVLoaded = Boolean(currentCVData.basics.name?.trim());
  const isLongOffer = jobOffer.length > LONG_OFFER_THRESHOLD;

  const handleSubmit = useCallback(async () => {
    if (!jobOffer.trim()) return;

    if (!hasAIConfig()) {
      setStep('check-key');
      return;
    }

    const config = loadAIConfig();
    if (!config) {
      setStep('check-key');
      return;
    }

    setStep('processing');

    try {
      const res = await fetch('/api/tailor-cv', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jobOffer: jobOffer.trim(),
          cvData: hasCVLoaded ? currentCVData : undefined,
          provider: config.provider,
          apiKey: config.apiKey,
          model: config.model,
          baseUrl: config.baseUrl,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({ error: 'Error desconocido.' }));
        setError(data.error ?? 'Error al adaptar el CV.');
        setStep('error');
        return;
      }

      const data: TailorResult = await res.json();
      setResult(data);
      setStep('preview');
    } catch {
      setError('No se pudo conectar con el servicio de IA. Verifica tu conexión a internet e intenta de nuevo.');
      setStep('error');
    }
  }, [jobOffer, hasCVLoaded, currentCVData]);

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
            Para adaptar tu CV necesitas configurar una API key de un proveedor de IA.
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

  if (step === 'processing') {
    return (
      <Modal open={open} onClose={handleClose} title="Adaptar a oferta">
        <div className="flex flex-col items-center gap-3 py-4">
          <svg className="animate-spin h-8 w-8 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" aria-hidden="true">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          <p className="text-sm text-gray-600">
            {hasCVLoaded
              ? 'Adaptando tu CV a la oferta... Esto puede tardar unos segundos.'
              : 'Generando un CV de ejemplo para la oferta... Esto puede tardar unos segundos.'}
          </p>
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
        title={result.mode === 'tailored' ? 'CV adaptado a la oferta' : 'CV generado desde la oferta'}
        confirmLabel="Aplicar cambios"
      >
        <div className="space-y-2">
          {result.mode === 'generated' && (
            <div className="p-3 bg-blue-50 rounded-lg border border-blue-200 mb-3">
              <p className="text-sm text-blue-800">
                Se generó un CV de ejemplo. Deberás completar tus datos personales y ajustar el contenido a tu experiencia real.
              </p>
            </div>
          )}
          {result.data.basics.name && (
            <p><strong>Nombre:</strong> {result.data.basics.name}</p>
          )}
          {result.data.basics.label && (
            <p><strong>Título:</strong> {result.data.basics.label}</p>
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
          Ya tienes datos en el editor. Aplicar estos cambios reemplazará <strong>todos</strong> los
          datos actuales. Esta acción no se puede deshacer.
        </p>
      </Modal>
    );
  }

  if (step === 'success') {
    return (
      <Modal open={open} onClose={handleClose} title="CV actualizado" cancelLabel="Cerrar">
        <p>
          {result?.mode === 'tailored'
            ? 'Tu CV ha sido adaptado exitosamente a la oferta. Revisa cada sección para verificar los cambios.'
            : 'Se generó un CV de ejemplo basado en la oferta. Completa tus datos personales y ajusta el contenido.'}
        </p>
      </Modal>
    );
  }

  if (step === 'error') {
    return (
      <Modal
        open={open}
        onClose={handleClose}
        onConfirm={reset}
        title="Error"
        confirmLabel="Intentar de nuevo"
        cancelLabel="Cancelar"
      >
        <p className="whitespace-pre-line text-red-600">{error}</p>
      </Modal>
    );
  }

  // idle
  return (
    <Modal open={open} onClose={handleClose} title="Adaptar CV a oferta de trabajo">
      <div className="space-y-4">
        <p className="text-sm text-gray-500">
          {hasCVLoaded
            ? 'Pega la descripción de la oferta de trabajo y la IA adaptará tu CV para que sea más relevante.'
            : 'No tienes un CV cargado. Pega la oferta y se generará un CV de ejemplo que podrás completar con tus datos.'}
        </p>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Oferta de trabajo
          </label>
          <textarea
            value={jobOffer}
            onChange={(e) => setJobOffer(e.target.value)}
            placeholder="Pega aquí el título, descripción, requisitos y responsabilidades de la oferta..."
            rows={8}
            className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-y"
          />
          {isLongOffer && (
            <p className="text-xs text-amber-600 mt-1">
              ⚠️ La oferta es muy larga ({jobOffer.length.toLocaleString()} caracteres). Modelos con ventana de contexto pequeña podrían fallar.
            </p>
          )}
        </div>
        <div className="flex justify-end gap-2">
          <Button variant="secondary" size="sm" onClick={handleClose}>
            Cancelar
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={handleSubmit}
            disabled={!jobOffer.trim()}
          >
            {hasCVLoaded ? 'Adaptar CV' : 'Generar CV'}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
