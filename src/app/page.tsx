'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { hasExistingData, clearCV } from '@/lib/storage';
import { useCVContext } from '@/providers/cv-provider';
import { createEmptyCVData } from '@/lib/schemas/cv';

function HomePage() {
  const router = useRouter();
  const cvContext = useCVContext();
  const [hasData, setHasData] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    setHasData(hasExistingData());
  }, []);

  const handleNew = () => {
    if (hasData) {
      setShowConfirm(true);
    } else {
      cvContext.replaceAll(createEmptyCVData());
      router.push('/editor');
    }
  };

  const confirmNew = () => {
    clearCV();
    cvContext.replaceAll(createEmptyCVData());
    setShowConfirm(false);
    router.push('/editor');
  };

  return (
    <div className="flex flex-1 items-center justify-center">
      <div className="flex flex-col items-center gap-6 text-center px-4">
        <h1 className="text-4xl font-bold text-gray-900">Headless CV</h1>
        <p className="text-lg text-gray-500 max-w-md">
          Crea tu currículum perfecto. Sin diseño. Sin errores.
        </p>

        <div className="flex flex-col gap-3 w-full max-w-xs">
          <Button size="lg" onClick={handleNew} className="w-full">
            Crear CV nuevo
          </Button>

          <Button
            size="lg"
            variant="secondary"
            onClick={() => router.push('/editor?openPdfImport=1')}
            className="w-full"
          >
            Importar desde PDF
          </Button>

          {hasData && (
            <>
              <Button size="lg" variant="secondary" onClick={() => router.push('/editor')} className="w-full">
                Continuar editando
              </Button>
              <p className="text-sm text-gray-400">Tienes un CV guardado</p>
            </>
          )}
        </div>
      </div>

      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-xl shadow-xl p-6 max-w-sm mx-4 space-y-4">
            <h2 className="text-lg font-semibold text-gray-900">¿Crear un CV nuevo?</h2>
            <p className="text-sm text-gray-600">
              Ya tienes un CV guardado. ¿Deseas crear uno nuevo? Se perderán los datos actuales.
            </p>
            <div className="flex gap-3 justify-end">
              <Button variant="ghost" onClick={() => setShowConfirm(false)}>
                Cancelar
              </Button>
              <Button variant="danger" onClick={confirmNew}>
                Crear nuevo
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Next.js requires default export for page routes
// eslint-disable-next-line import/no-default-export
export default HomePage;
