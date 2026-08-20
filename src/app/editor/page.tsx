'use client';

import { Suspense } from 'react';
import { useCVContext } from '@/providers/cv-provider';
import { EditorLayout } from '@/components/editor-layout';
import { useSearchParams } from 'next/navigation';

function EditorContent() {
  const { isLoaded } = useCVContext();
  const searchParams = useSearchParams();
  const openPdfImport = searchParams.get('openPdfImport') === '1';
  const openTailor = searchParams.get('openTailor') === '1';

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="flex flex-col items-center gap-3">
          <svg className="animate-spin h-8 w-8 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" aria-hidden="true">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          <span className="text-sm text-gray-500">Cargando tu CV...</span>
        </div>
      </div>
    );
  }

  return <EditorLayout initialOpenPdfImport={openPdfImport} initialOpenTailor={openTailor} />;
}

export default function EditorPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center h-screen">
        <span className="text-sm text-gray-500">Cargando...</span>
      </div>
    }>
      <EditorContent />
    </Suspense>
  );
}
